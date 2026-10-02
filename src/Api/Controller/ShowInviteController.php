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

        return new JsonResponse($this->invites->find($code));
    }
}
