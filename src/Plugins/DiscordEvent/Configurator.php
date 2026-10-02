<?php

/*
 * This file is part of fof/discord-autolink.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\DiscordAutolink\Plugins\DiscordEvent;

use FoF\DiscordAutolink\Plugins\Discord;
use s9e\TextFormatter\Configurator\Items\Tag;

/**
 * Scheduled event pages: https://discord.com/events/GUILD_ID/EVENT_ID.
 *
 * Unlike an event invite, these carry no invite code, and Discord only exposes
 * the event to authenticated members, so they render as static chips.
 */
class Configurator extends Discord
{
    protected string $regexp = '/\bhttps?:\/\/(?:(?:www|ptb|canary)\.)?discord(?:app)?\.com\/events\/(\d{17,20})\/(\d{17,20})\b/i';
    protected ?string $tagName = 'DISCORDEVENT';

    protected function getClassName(): string
    {
        return 'DiscordEmbed--event';
    }

    protected function getSpecificAttributes(Tag $tag): void
    {
        $tag->attributes->add('guild');
        $tag->attributes->add('event');
    }

    protected function getTemplateHref(): string
    {
        return 'https://discord.com/events/<xsl:value-of select="@guild"/>/<xsl:value-of select="@event"/>';
    }

    protected function getTemplateContent(): string
    {
        return '<i class="fas fa-calendar-alt" aria-hidden="true" /><span class="DiscordEmbed-label" data-discord-label="event" />';
    }
}
