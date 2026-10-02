<?php

/*
 * This file is part of fof/discord-autolink.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\DiscordAutolink\Discord;

use GuzzleHttp\ClientInterface;

/**
 * Looks up invites on Discord's public, unauthenticated invite API and
 * normalises them into the shape the forum's invite cards render.
 */
class InviteRepository
{
    public const API_URL = 'https://discord.com/api/v10';

    public const CDN_URL = 'https://cdn.discordapp.com';

    public function __construct(
        protected ClientInterface $http
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function find(string $code): array
    {
        $response = $this->http->request('GET', self::API_URL.'/invites/'.rawurlencode($code), [
            'query' => ['with_counts' => 'true'],
        ]);

        /** @var array<string, mixed> $invite */
        $invite = json_decode((string) $response->getBody(), true);

        return $this->normalise($invite);
    }

    /**
     * @param array<string, mixed> $invite
     *
     * @return array<string, mixed>
     */
    protected function normalise(array $invite): array
    {
        $guild = $invite['guild'] ?? [];

        return [
            'code'    => $invite['code'],
            'url'     => 'https://discord.gg/'.$invite['code'],
            'guild'   => [
                'id'          => $guild['id'] ?? null,
                'name'        => $guild['name'] ?? null,
                'iconUrl'     => $this->iconUrl($guild),
                'memberCount' => $invite['approximate_member_count'] ?? null,
                'onlineCount' => $invite['approximate_presence_count'] ?? null,
            ],
            'channel' => isset($invite['channel']['name']) ? ['name' => $invite['channel']['name']] : null,
            'event'   => null,
        ];
    }

    /**
     * @param array<string, mixed> $guild
     */
    protected function iconUrl(array $guild): ?string
    {
        if (empty($guild['id']) || empty($guild['icon'])) {
            return null;
        }

        return sprintf('%s/icons/%s/%s.png?size=128', self::CDN_URL, $guild['id'], $guild['icon']);
    }
}
