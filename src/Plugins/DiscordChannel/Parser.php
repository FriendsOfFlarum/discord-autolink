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

use s9e\TextFormatter\Plugins\ParserBase;

class Parser extends ParserBase
{
    public function parse($text, array $matches)
    {
        foreach ($matches as $m) {
            $tag = $this->parser->addSelfClosingTag($this->config['tagName'], $m[0][1], \strlen($m[0][0]), -10);

            $hasMessage = isset($m[3]) && $m[3][1] >= 0;

            $tag->setAttributes([
                'guild'   => $m[1][0],
                'channel' => $m[2][0],
                'type'    => $hasMessage ? 'message' : 'channel',
            ]);

            if ($hasMessage) {
                $tag->setAttribute('message', $m[3][0]);
            }
        }
    }
}
