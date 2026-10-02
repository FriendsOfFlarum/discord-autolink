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
use Illuminate\Contracts\Cache\Repository as Cache;
use GuzzleHttp\Exception\ClientException;

/**
 * Looks up invites on Discord's public, unauthenticated invite API and
 * normalises them into the shape the forum's invite cards render.
 */
class InviteRepository
{
    public const API_URL = 'https://discord.com/api/v10';

    public const CDN_URL = 'https://cdn.discordapp.com';

    /**
     * Seconds to remember a found invite. Member counts drift, so keep this short.
     */
    protected const TTL = 600;

    /**
     * Seconds to remember that an invite does not exist.
     */
    protected const UNKNOWN_TTL = 300;

    /**
     * Discord's GUILD_SCHEDULED_EVENT_STATUS values.
     */
    protected const EVENT_STATUSES = [
        1 => 'scheduled',
        2 => 'active',
        3 => 'completed',
        4 => 'canceled',
    ];

    public function __construct(
        protected ClientInterface $http,
        protected Cache $cache
    ) {
    }

    /**
     * @throws UnknownInviteException
     *
     * @return array<string, mixed>
     */
    public function find(string $code, ?string $eventId = null): array
    {
        $key = 'fof-discord-autolink.invite.'.$code.'.'.($eventId ?? '');

        $invite = $this->cache->get($key);

        if ($invite === null) {
            try {
                $invite = $this->fetch($code, $eventId);
                $this->cache->put($key, $invite, self::TTL);
            } catch (UnknownInviteException $e) {
                $this->cache->put($key, false, self::UNKNOWN_TTL);

                throw $e;
            }
        }

        if ($invite === false) {
            throw new UnknownInviteException("Unknown Discord invite: $code");
        }

        return $invite;
    }

    /**
     * @throws UnknownInviteException
     *
     * @return array<string, mixed>
     */
    protected function fetch(string $code, ?string $eventId): array
    {
        $query = ['with_counts' => 'true'];

        if ($eventId !== null) {
            $query['guild_scheduled_event_id'] = $eventId;
        }

        try {
            $response = $this->http->request('GET', self::API_URL.'/invites/'.rawurlencode($code), [
                'query' => $query,
            ]);
        } catch (ClientException $e) {
            if ($e->getResponse()->getStatusCode() === 404) {
                throw new UnknownInviteException("Unknown Discord invite: $code", 0, $e);
            }

            throw $e;
        }

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
        $event = $invite['guild_scheduled_event'] ?? null;

        return [
            'code'    => $invite['code'],
            'url'     => 'https://discord.gg/'.$invite['code'].($event ? '?event='.$event['id'] : ''),
            'guild'   => [
                'id'          => $guild['id'] ?? null,
                'name'        => $guild['name'] ?? null,
                'iconUrl'     => $this->iconUrl($guild),
                'memberCount' => $invite['approximate_member_count'] ?? null,
                'onlineCount' => $invite['approximate_presence_count'] ?? null,
            ],
            'channel' => isset($invite['channel']['name']) ? ['name' => $invite['channel']['name']] : null,
            'event'   => $event ? $this->normaliseEvent($event, $invite['channel'] ?? null) : null,
        ];
    }

    /**
     * @param array<string, mixed>      $event
     * @param array<string, mixed>|null $channel the invite's channel, which for event invites is usually the event's
     *
     * @return array<string, mixed>
     */
    protected function normaliseEvent(array $event, ?array $channel): array
    {
        $inEventChannel = $channel && isset($event['channel_id']) && ($channel['id'] ?? null) === $event['channel_id'];

        return [
            'id'              => $event['id'],
            'name'            => $event['name'] ?? null,
            'description'     => ($event['description'] ?? '') !== '' ? $event['description'] : null,
            'startsAt'        => $event['scheduled_start_time'] ?? null,
            'endsAt'          => $event['scheduled_end_time'] ?? null,
            'status'          => self::EVENT_STATUSES[$event['status'] ?? 0] ?? null,
            'interestedCount' => $event['user_count'] ?? null,
            'imageUrl'        => empty($event['image']) ? null : sprintf('%s/guild-events/%s/%s.png?size=512', self::CDN_URL, $event['id'], $event['image']),
            'channelName'     => $inEventChannel ? ($channel['name'] ?? null) : null,
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
