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
 * Discord could not answer: it is down, slow, rate limiting us, or sent nonsense.
 */
class DiscordUnavailableException extends RuntimeException
{
}
