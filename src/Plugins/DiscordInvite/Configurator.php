<?php

/*
 * This file is part of fof/discord-autolink.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\DiscordAutolink\Plugins\DiscordInvite;

use FoF\DiscordAutolink\Plugins\Discord;
use s9e\TextFormatter\Configurator\Items\Tag;

/**
 * Server invites, optionally pointing at a scheduled event:
 *   https://discord.gg/CODE
 *   https://discord.gg/CODE?event=EVENT_ID.
 */
class Configurator extends Discord
{
    protected string $regexp = '/\bhttps?:\/\/discord\.gg\/([A-Za-z0-9-]{2,32})(?![\w-])/i';
    protected ?string $tagName = 'DISCORDINVITE';

    protected function getClassName(): string
    {
        return 'DiscordEmbed--invite';
    }

    protected function getSpecificAttributes(Tag $tag): void
    {
        $tag->attributes->add('code');
    }

    protected function getTemplateHref(): string
    {
        return 'https://discord.gg/<xsl:value-of select="@code"/>';
    }

    protected function getTemplateDataAttributes(): string
    {
        return '<xsl:attribute name="data-discord-invite"><xsl:value-of select="@code"/></xsl:attribute>';
    }

    protected function getTemplateContent(): string
    {
        return '<span class="DiscordEmbed-label">discord.gg/<xsl:value-of select="@code"/></span>';
    }
}
