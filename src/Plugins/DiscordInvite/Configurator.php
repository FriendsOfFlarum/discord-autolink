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
 *   https://discord.com/invite/CODE (also discordapp.com)
 *   https://discord.gg/CODE?event=EVENT_ID.
 */
class Configurator extends Discord
{
    protected string $regexp = '/\bhttps?:\/\/(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/([A-Za-z0-9-]{2,32})(?![\w-])(?:\/?\?event=(\d{17,20})\b)?/i';
    protected ?string $tagName = 'DISCORDINVITE';

    protected function getClassName(): string
    {
        return 'DiscordEmbed--invite';
    }

    protected function getSpecificAttributes(Tag $tag): void
    {
        $tag->attributes->add('code');
        $tag->attributes->add('event')->required = false;
    }

    protected function getTemplateHref(): string
    {
        return 'https://discord.gg/<xsl:value-of select="@code"/><xsl:if test="@event">?event=<xsl:value-of select="@event"/></xsl:if>';
    }

    protected function getTemplateDataAttributes(): string
    {
        return '<xsl:attribute name="data-discord-invite"><xsl:value-of select="@code"/></xsl:attribute>'
            .'<xsl:if test="@event"><xsl:attribute name="data-discord-event"><xsl:value-of select="@event"/></xsl:attribute></xsl:if>';
    }

    protected function getTemplateContent(): string
    {
        return '<span class="DiscordEmbed-label">discord.gg/<xsl:value-of select="@code"/></span>';
    }
}
