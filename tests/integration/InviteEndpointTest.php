<?php

/*
 * This file is part of fof/discord-autolink.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\DiscordAutolink\Tests\integration;

use Flarum\Testing\integration\TestCase;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\Test;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

class InviteEndpointTest extends TestCase
{
    /**
     * Requests the fake Discord API received, oldest first.
     *
     * @var array<int, array{request: RequestInterface}>
     */
    protected array $discordRequests = [];

    public function setUp(): void
    {
        parent::setUp();

        $this->extension('fof-discord-autolink');
    }

    /**
     * Replace the outbound Discord HTTP client with one that answers from a queue.
     *
     * @param array<int, ResponseInterface|\Throwable> $responses
     */
    protected function fakeDiscord(array $responses): void
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::history($this->discordRequests));

        $this->app()->getContainer()->instance('fof-discord-autolink.http', new Client(['handler' => $stack]));
    }

    protected function fixture(string $name): Response
    {
        return new Response(200, ['Content-Type' => 'application/json'], (string) file_get_contents(__DIR__.'/../fixtures/'.$name));
    }

    /**
     * @param array<string, string> $query
     */
    protected function getInvite(string $code, array $query = []): ResponseInterface
    {
        return $this->send(
            $this->request('GET', '/api/discord/invites/'.$code)->withQueryParams($query)
        );
    }

    /**
     * @return array<string, mixed>
     */
    protected function json(ResponseInterface $response): array
    {
        return json_decode((string) $response->getBody(), true);
    }

    #[Test]
    public function guests_can_fetch_the_server_card_for_an_invite()
    {
        $this->fakeDiscord([$this->fixture('invite.json')]);

        $response = $this->getInvite('G8MGEsC53');

        $this->assertSame(200, $response->getStatusCode(), (string) $response->getBody());

        $data = $this->json($response);

        $this->assertSame('G8MGEsC53', $data['code']);
        $this->assertSame('https://discord.gg/G8MGEsC53', $data['url']);
        $this->assertSame('360670804914208769', $data['guild']['id']);
        $this->assertSame('Flarum', $data['guild']['name']);
        $this->assertSame('https://cdn.discordapp.com/icons/360670804914208769/42da41124318a98737aaf686872845a9.png?size=128', $data['guild']['iconUrl']);
        $this->assertSame(547, $data['guild']['memberCount']);
        $this->assertSame(98, $data['guild']['onlineCount']);
        $this->assertSame('devs', $data['channel']['name']);
        $this->assertNull($data['event']);

        $this->assertCount(1, $this->discordRequests);
        $sent = $this->discordRequests[0]['request'];
        $this->assertSame('https://discord.com/api/v10/invites/G8MGEsC53?with_counts=true', (string) $sent->getUri());
    }

    #[Test]
    public function an_unknown_or_expired_invite_is_not_found()
    {
        $this->fakeDiscord([
            new Response(404, ['Content-Type' => 'application/json'], '{"message": "Unknown Invite", "code": 10006}'),
        ]);

        $response = $this->getInvite('expired123');

        $this->assertSame(404, $response->getStatusCode(), (string) $response->getBody());
        $this->assertSame('not_found', $this->json($response)['errors'][0]['code']);
    }

    #[Test]
    public function an_event_invite_includes_the_scheduled_event()
    {
        $this->fakeDiscord([$this->fixture('event-invite.json')]);

        $response = $this->getInvite('te7dMZm8', ['event' => '1555683235751792691']);

        $this->assertSame(200, $response->getStatusCode(), (string) $response->getBody());

        $data = $this->json($response);

        $this->assertSame('https://discord.gg/te7dMZm8?event=1555683235751792691', $data['url']);
        $this->assertSame([
            'id'              => '1555683235751792691',
            'name'            => 'Good things come in twos',
            'description'     => null,
            'startsAt'        => '2026-10-09T18:00:00+00:00',
            'endsAt'          => null,
            'status'          => 'scheduled',
            'interestedCount' => 2,
            'imageUrl'        => null,
            'channelName'     => 'flarum-stage',
        ], $data['event']);

        $sent = $this->discordRequests[0]['request'];
        $this->assertSame('https://discord.com/api/v10/invites/te7dMZm8?with_counts=true&guild_scheduled_event_id=1555683235751792691', (string) $sent->getUri());
    }
}
