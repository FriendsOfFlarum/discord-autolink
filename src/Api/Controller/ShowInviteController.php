<?php

/*
 * This file is part of fof/discord-autolink.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\DiscordAutolink\Api\Controller;

use FoF\DiscordAutolink\Discord\InviteRepository;
use FoF\DiscordAutolink\Discord\UnknownInviteException;
use Illuminate\Support\Arr;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class ShowInviteController implements RequestHandlerInterface
{
    public function __construct(
        protected InviteRepository $invites
    ) {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $code = (string) Arr::get($request->getAttribute('routeParameters'), 'code');

        // Same alphabet the formatter accepts; anything else cannot be a real invite.
        if (! preg_match('/^[A-Za-z0-9-]{2,32}$/', $code)) {
            throw new UnknownInviteException("Malformed Discord invite code: $code");
        }

        $event = Arr::get($request->getQueryParams(), 'event');
        $event = is_string($event) && ctype_digit($event) ? $event : null;

        return new JsonResponse($this->invites->find($code, $event));
    }
}
