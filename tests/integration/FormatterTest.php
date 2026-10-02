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

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;
use PHPUnit\Framework\Attributes\Test;

class FormatterTest extends TestCase
{
    use RetrievesAuthorizedUsers;

    public function setUp(): void
    {
        parent::setUp();

        $this->prepareDatabase([
            Discussion::class => [
                ['id' => 1, 'title' => __CLASS__, 'created_at' => Carbon::now()->toDateTimeString(), 'user_id' => 2, 'first_post_id' => 1],
            ],
            Post::class => [
                ['id' => 1, 'discussion_id' => 1, 'number' => 1, 'created_at' => Carbon::now()->subDay()->toDateTimeString(), 'user_id' => 2, 'type' => 'comment', 'content' => '<t></t>'],
            ],
            User::class => [
                $this->normalUser(),
            ],
        ]);

        $this->extension('fof-discord-autolink');
    }

    /**
     * Posts the content as a reply and returns the rendered HTML.
     */
    protected function render(string $content): string
    {
        $response = $this->send(
            $this->request('POST', '/api/posts', [
                'authenticatedAs' => 2,
                'json'            => [
                    'data' => [
                        'attributes'    => ['content' => $content],
                        'relationships' => ['discussion' => ['data' => ['id' => 1]]],
                    ],
                ],
            ])
        );

        $this->assertEquals(201, $response->getStatusCode(), (string) $response->getBody());

        return json_decode((string) $response->getBody(), true)['data']['attributes']['contentHtml'];
    }

    /**
     * Every rendered Discord link must open in a new tab, with a safe rel.
     */
    protected function assertOpensInNewTab(string $html, int $expectedLinks = 1): void
    {
        $this->assertSame($expectedLinks, substr_count($html, 'class="DiscordEmbed '));
        $this->assertSame($expectedLinks, substr_count($html, 'target="_blank"'));
        $this->assertSame($expectedLinks, substr_count($html, 'rel="ugc noopener noreferrer"'));
    }

    #[Test]
    public function it_renders_a_discord_gg_server_invite()
    {
        $html = $this->render('Join us: https://discord.gg/G8MGEsC53');

        $this->assertStringContainsString('DiscordEmbed--invite', $html);
        $this->assertStringContainsString('href="https://discord.gg/G8MGEsC53"', $html);
        $this->assertStringContainsString('data-discord-invite="G8MGEsC53"', $html);
        $this->assertStringNotContainsString('data-discord-event', $html);
        $this->assertOpensInNewTab($html);
    }
}
