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

use s9e\TextFormatter\Plugins\ParserBase;

class Parser extends ParserBase
{
    public function parse($text, array $matches)
    {
        foreach ($matches as $m) {
            $tag = $this->parser->addSelfClosingTag($this->config['tagName'], $m[0][1], \strlen($m[0][0]), -10);

            $tag->setAttributes([
                'guild' => $m[1][0],
                'event' => $m[2][0],
            ]);
        }
    }
}
