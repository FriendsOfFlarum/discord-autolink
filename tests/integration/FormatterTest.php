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

    #[Test]
    public function it_renders_discord_com_and_discordapp_com_invites_as_canonical_discord_gg_links()
    {
        $html = $this->render('https://discord.com/invite/flarum and https://discordapp.com/invite/G8MGEsC53');

        $this->assertStringContainsString('href="https://discord.gg/flarum"', $html);
        $this->assertStringContainsString('data-discord-invite="flarum"', $html);
        $this->assertStringContainsString('href="https://discord.gg/G8MGEsC53"', $html);
        $this->assertStringContainsString('data-discord-invite="G8MGEsC53"', $html);
        $this->assertOpensInNewTab($html, 2);
    }

    #[Test]
    public function it_renders_an_event_invite()
    {
        $html = $this->render('Come along! https://discord.gg/te7dMZm8?event=1555683235751792691');

        $this->assertStringContainsString('DiscordEmbed--invite', $html);
        $this->assertStringContainsString('href="https://discord.gg/te7dMZm8?event=1555683235751792691"', $html);
        $this->assertStringContainsString('data-discord-invite="te7dMZm8"', $html);
        $this->assertStringContainsString('data-discord-event="1555683235751792691"', $html);
        $this->assertOpensInNewTab($html);
    }

    #[Test]
    public function it_renders_a_message_link_as_a_message_chip()
    {
        $html = $this->render('See https://discord.com/channels/360670804914208769/385414934844145664/1555689993194704978');

        $this->assertStringContainsString('DiscordEmbed--message', $html);
        $this->assertStringContainsString('href="https://discord.com/channels/360670804914208769/385414934844145664/1555689993194704978"', $html);
        $this->assertOpensInNewTab($html);
    }

    #[Test]
    public function it_renders_a_channel_link_as_a_channel_chip()
    {
        $html = $this->render('Chat in https://ptb.discord.com/channels/360670804914208769/385414934844145664 please');

        $this->assertStringContainsString('DiscordEmbed--channel', $html);
        $this->assertStringNotContainsString('DiscordEmbed--message', $html);
        $this->assertStringContainsString('href="https://discord.com/channels/360670804914208769/385414934844145664"', $html);
        $this->assertStringContainsString('</a> please', $html);
        $this->assertOpensInNewTab($html);
    }

    #[Test]
    public function it_renders_a_direct_message_link_as_a_message_chip()
    {
        $html = $this->render('https://discord.com/channels/@me/385414934844145664/1555689993194704978');

        $this->assertStringContainsString('DiscordEmbed--message', $html);
        $this->assertStringContainsString('href="https://discord.com/channels/@me/385414934844145664/1555689993194704978"', $html);
        $this->assertOpensInNewTab($html);
    }

    #[Test]
    public function it_renders_a_scheduled_event_page_link_as_an_event_chip()
    {
        $html = $this->render('https://discord.com/events/360670804914208769/1555683235751792691');

        $this->assertStringContainsString('DiscordEmbed--event', $html);
        $this->assertStringContainsString('href="https://discord.com/events/360670804914208769/1555683235751792691"', $html);
        $this->assertOpensInNewTab($html);
    }
}
