<?php

/*
 * This file is part of fof/discord-autolink.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\DiscordAutolink\Plugins;

use s9e\TextFormatter\Configurator\Items\Tag;
use s9e\TextFormatter\Plugins\ConfiguratorBase;

abstract class Discord extends ConfiguratorBase
{
    protected ?string $tagName = null;

    abstract protected function getClassName(): string;

    abstract protected function getSpecificAttributes(Tag $tag): void;

    abstract protected function getTemplateHref(): string;

    abstract protected function getTemplateContent(): string;

    protected function setUp(): void
    {
        if (isset($this->configurator->tags[$this->tagName])) {
            return;
        }

        $tag = $this->configurator->tags->add($this->tagName);

        $this->getSpecificAttributes($tag);
        $tag->setTemplate($this->makeTemplate());
    }

    protected function makeTemplate(): string
    {
        return sprintf(
            '<a class="DiscordEmbed %1$s" target="_blank" rel="ugc noopener noreferrer">
            <xsl:attribute name="href">%2$s</xsl:attribute>
            %3$s
            <i class="fab fa-discord" aria-hidden="true" />
            %4$s
        </a>',
            $this->getClassName(),
            $this->getTemplateHref(),
            $this->getTemplateDataAttributes(),
            $this->getTemplateContent()
        );
    }

    /**
     * Extra attributes (e.g. data-*) added to the anchor, as xsl:attribute nodes.
     */
    protected function getTemplateDataAttributes(): string
    {
        return '';
    }

    public function getJSParser()
    {
        return \file_get_contents(\dirname((string) (new \ReflectionClass($this))->getFileName()).'/Parser.js');
    }
}
