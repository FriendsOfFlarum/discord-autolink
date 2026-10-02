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

use Flarum\Extend;
use s9e\TextFormatter\Configurator;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Formatter())
        ->configure(function (Configurator $configurator) {
            $configurator->plugins->set('DiscordInviteAutolink', Plugins\DiscordInvite\Configurator::class);
            $configurator->plugins->set('DiscordChannelAutolink', Plugins\DiscordChannel\Configurator::class);
        }),
];
