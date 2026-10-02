<?php

/*
 * This file is part of fof/discord-autolink.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\DiscordAutolink;

use Flarum\Foundation\AbstractServiceProvider;
use GuzzleHttp\Client;

class DiscordServiceProvider extends AbstractServiceProvider
{
    public function register(): void
    {
        $this->container->singleton('fof-discord-autolink.http', function () {
            return new Client([
                'timeout'         => 5,
                'connect_timeout' => 3,
                'headers'         => [
                    'Accept'     => 'application/json',
                    'User-Agent' => 'FoF Discord Autolink (https://github.com/FriendsOfFlarum/discord-autolink)',
                ],
            ]);
        });

        $this->container->when(Discord\InviteRepository::class)
            ->needs(\GuzzleHttp\ClientInterface::class)
            ->give(fn () => $this->container->make('fof-discord-autolink.http'));
    }
}
