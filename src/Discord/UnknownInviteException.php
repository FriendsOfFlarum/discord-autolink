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

use RuntimeException;

/**
 * Discord does not know the invite: it never existed, expired, or was revoked.
 */
class UnknownInviteException extends RuntimeException
{
}
