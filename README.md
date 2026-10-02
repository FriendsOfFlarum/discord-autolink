# FriendsOfFlarum Discord Autolink

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/fof/discord-autolink.svg)](https://packagist.org/packages/fof/discord-autolink) [![OpenCollective](https://img.shields.io/badge/opencollective-fof-blue.svg)](https://opencollective.com/fof/donate)

A [Flarum](https://flarum.org) extension. Turns the Discord links people share in posts into rich cards and tidy inline chips.

### What it recognises

| Link | Example | Renders as |
| --- | --- | --- |
| Server invite | `https://discord.gg/G8MGEsC53`, `https://discord.com/invite/flarum` | Card with the server's icon, name, online and member counts, and a Join button |
| Event invite | `https://discord.gg/te7dMZm8?event=1555683235751792691` | Card with the event's time, name, description, channel and interested count, above the server |
| Expired or revoked invite | | "Invalid Invite" card |
| Channel | `https://discord.com/channels/<server>/<channel>` | Inline chip |
| Message | `https://discord.com/channels/<server>/<channel>/<message>`, including `@me` DMs | Inline chip |
| Scheduled event page | `https://discord.com/events/<server>/<event>` | Inline chip |

`discordapp.com` and the `ptb.` / `canary.` clients are recognised too. All links are normalised to their canonical `discord.gg` / `discord.com` form and open in a new tab.

Channel, message and event page links stay as chips because Discord only shows their details to signed-in members.

### How invite cards work

Posts are stored with a plain link, so they always work, even without JavaScript and in emails. In the browser, the link is upgraded to a card using data from `GET /api/discord/invites/{code}`. This endpoint asks Discord's public invite API on the forum's behalf, which means:

- browsers never contact the Discord API (card images do load from Discord's CDN)
- lookups are cached for 10 minutes (5 minutes for unknown invites)
- lookups are limited to 60 a minute per IP address, so nobody can use the forum to flood Discord
- if Discord is unavailable, the plain link is left as it is

Cards also appear in the composer preview while writing a post.

### Installation

```sh
composer require fof/discord-autolink:"*"
```

### Updating

```sh
composer update fof/discord-autolink
php flarum cache:clear
```

### Links

[<img src="https://opencollective.com/fof/donate/button@2x.png?color=blue" height="25" />](https://opencollective.com/fof/donate)

- [Packagist](https://packagist.org/packages/fof/discord-autolink)
- [GitHub](https://github.com/FriendsOfFlarum/discord-autolink)

An extension by [FriendsOfFlarum](https://github.com/FriendsOfFlarum).
