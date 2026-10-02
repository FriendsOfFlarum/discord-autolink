<?php

/*
 * This file is part of fof/discord-autolink.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\DiscordAutolink\Api;

use Carbon\Carbon;
use Illuminate\Contracts\Cache\Repository as Cache;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Invite lookups are unauthenticated and may reach out to Discord, so cap how
 * many a single IP address can make. Without this, anyone could enumerate
 * random codes and get the forum's server rate limited by Discord.
 */
class ThrottleInviteLookups
{
    public const LIMIT_PER_MINUTE = 60;

    public function __construct(
        protected Cache $cache
    ) {
    }

    public function __invoke(ServerRequestInterface $request): ?bool
    {
        if ($request->getAttribute('routeName') !== 'fof-discord-autolink.invites.show') {
            return null;
        }

        $key = 'fof-discord-autolink.throttle.'.sha1((string) $request->getAttribute('ipAddress')).'.'.floor(Carbon::now()->getTimestamp() / 60);

        $this->cache->add($key, 0, 120);
        $count = (int) $this->cache->increment($key);

        return $count > self::LIMIT_PER_MINUTE ? true : null;
    }
}
