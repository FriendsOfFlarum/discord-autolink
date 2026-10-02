<?php

/*
 * This file is part of fof/discord-autolink.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\DiscordAutolink\Plugins\DiscordChannel;

use FoF\DiscordAutolink\Plugins\Discord;
use s9e\TextFormatter\Configurator\Items\Tag;

/**
 * Channel and message links, including direct messages (@me) and the ptb/canary clients:
 *   https://discord.com/channels/GUILD_ID/CHANNEL_ID
 *   https://discord.com/channels/GUILD_ID/CHANNEL_ID/MESSAGE_ID
 *
 * Discord exposes no unauthenticated API for these, so they render as static chips.
 */
class Configurator extends Discord
{
    protected string $regexp = '/\bhttps?:\/\/(?:(?:www|ptb|canary)\.)?discord(?:app)?\.com\/channels\/(\d{17,20}|@me)\/(\d{17,20})(?:\/(\d{17,20}))?\b/i';
    protected ?string $tagName = 'DISCORDCHANNEL';

    protected function getClassName(): string
    {
        return 'DiscordEmbed--{@type}';
    }

    protected function getSpecificAttributes(Tag $tag): void
    {
        $tag->attributes->add('guild');
        $tag->attributes->add('channel');
        $tag->attributes->add('message')->required = false;
        $tag->attributes->add('type');
    }

    protected function getTemplateHref(): string
    {
        return 'https://discord.com/channels/<xsl:value-of select="@guild"/>/<xsl:value-of select="@channel"/><xsl:if test="@message">/<xsl:value-of select="@message"/></xsl:if>';
    }

    protected function getTemplateContent(): string
    {
        return <<<'XML'
<xsl:choose>
    <xsl:when test="@type = 'message'"><i class="fas fa-comment-alt" aria-hidden="true" /></xsl:when>
    <xsl:otherwise><i class="fas fa-hashtag" aria-hidden="true" /></xsl:otherwise>
</xsl:choose>
<span class="DiscordEmbed-label" data-discord-label="{@type}" />
XML;
    }
}
