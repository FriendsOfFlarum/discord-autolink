import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import app from 'flarum/forum/app';
import m from 'mithril';
import mq from 'mithril-query';
import { beforeAll, describe, expect, it } from '@jest/globals';
import DiscordInviteCard from '../../src/forum/components/DiscordInviteCard';
import type { DiscordInvite } from '../../src/forum/types';

const serverInvite: DiscordInvite = {
  code: 'G8MGEsC53',
  url: 'https://discord.gg/G8MGEsC53',
  guild: {
    id: '360670804914208769',
    name: 'Flarum',
    description: null,
    iconUrl: 'https://cdn.discordapp.com/icons/360670804914208769/42da41124318a98737aaf686872845a9.png?size=128',
    memberCount: 1547,
    onlineCount: 98,
    verified: false,
    partnered: false,
  },
  channel: { name: 'devs' },
  event: null,
};

function text(card: ReturnType<typeof mq>, selector: string): string | null {
  return card.first(selector).textContent;
}

beforeAll(() => {
  bootstrapForum();

  app.translator.addTranslations({
    'fof-discord-autolink.forum.invite.heading': "You've been invited to join a server",
    'fof-discord-autolink.forum.invite.online': '{count} Online',
    'fof-discord-autolink.forum.invite.members': '{count} Members',
    'fof-discord-autolink.forum.invite.join': 'Join',
    'fof-discord-autolink.forum.invite.verified': 'Verified',
    'fof-discord-autolink.forum.invite.partnered': 'Discord Partner',
  });
});

describe('DiscordInviteCard for a server invite', () => {
  it('shows the server name, icon and member counts', () => {
    const card = mq(m(DiscordInviteCard, { invite: serverInvite }));

    expect(card).toHaveElement('.DiscordInviteCard');
    expect(text(card, '.DiscordInviteCard-heading')).toBe("You've been invited to join a server");
    expect(text(card, '.DiscordInviteCard-name')).toBe('Flarum');
    expect(card).toHaveElementAttr('img.DiscordInviteCard-icon', 'src', serverInvite.guild.iconUrl);
    expect(text(card, '.DiscordInviteCard-online')).toBe('98 Online');
    expect(text(card, '.DiscordInviteCard-members')).toBe('1,547 Members');
    expect(text(card, '.DiscordInviteCard-join')).toBe('Join');
  });
});

describe('DiscordInviteCard for a server without an icon', () => {
  it('shows the initials of the server name instead', () => {
    const invite = { ...serverInvite, guild: { ...serverInvite.guild, name: 'Flarum Community Hub', iconUrl: null } };
    const card = mq(m(DiscordInviteCard, { invite }));

    expect(card).not.toHaveElement('img.DiscordInviteCard-icon');
    expect(text(card, '.DiscordInviteCard-icon--acronym')).toBe('FCH');
  });
});

describe('DiscordInviteCard badges', () => {
  it('marks verified servers', () => {
    const invite = { ...serverInvite, guild: { ...serverInvite.guild, verified: true } };
    const card = mq(m(DiscordInviteCard, { invite }));

    expect(card).toHaveElementAttr('.DiscordInviteCard-badge--verified', 'title', 'Verified');
    expect(card).not.toHaveElement('.DiscordInviteCard-badge--partnered');
  });

  it('marks partnered servers', () => {
    const invite = { ...serverInvite, guild: { ...serverInvite.guild, partnered: true } };
    const card = mq(m(DiscordInviteCard, { invite }));

    expect(card).toHaveElementAttr('.DiscordInviteCard-badge--partnered', 'title', 'Discord Partner');
  });

  it('shows no badge for ordinary servers', () => {
    const card = mq(m(DiscordInviteCard, { invite: serverInvite }));

    expect(card).not.toHaveElement('.DiscordInviteCard-badge');
  });
});
