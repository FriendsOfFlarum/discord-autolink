import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import app from 'flarum/forum/app';
import m from 'mithril';
import mq from 'mithril-query';
import dayjs from 'dayjs';
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
  // In the browser, Flarum exposes dayjs as a global; @flarum/jest-config does not.
  (globalThis as any).dayjs = dayjs;

  bootstrapForum();

  app.translator.addTranslations({
    'fof-discord-autolink.forum.invite.heading': "You've been invited to join a server",
    'fof-discord-autolink.forum.invite.online': '{count} Online',
    'fof-discord-autolink.forum.invite.members': '{count} Members',
    'fof-discord-autolink.forum.invite.join': 'Join',
    'fof-discord-autolink.forum.invite.verified': 'Verified',
    'fof-discord-autolink.forum.invite.invalid_heading': "You've been invited to join a server, but…",
    'fof-discord-autolink.forum.invite.invalid_title': 'Invalid Invite',
    'fof-discord-autolink.forum.invite.invalid_text': 'This invite may be expired, or you might not have permission to join.',
    'fof-discord-autolink.forum.event.heading': "You've been invited to an event",
    'fof-discord-autolink.forum.event.interested': '{count} interested',
    'fof-discord-autolink.forum.event.active': 'Happening now',
    'fof-discord-autolink.forum.event.completed': 'This event has ended',
    'fof-discord-autolink.forum.event.canceled': 'This event was cancelled',
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

const eventInvite: DiscordInvite = {
  ...serverInvite,
  code: 'te7dMZm8',
  url: 'https://discord.gg/te7dMZm8?event=1555683235751792691',
  channel: { name: 'flarum-stage' },
  event: {
    id: '1555683235751792691',
    name: 'Good things come in twos',
    description: 'Two releases, one stage.',
    startsAt: '2026-10-09T18:00:00+00:00',
    endsAt: null,
    status: 'scheduled',
    interestedCount: 2,
    imageUrl: null,
    channelName: 'flarum-stage',
  },
};

describe('DiscordInviteCard for an event invite', () => {
  it('shows the event, when it starts, and who is interested', () => {
    const card = mq(m(DiscordInviteCard, { invite: eventInvite }));

    expect(card).toHaveElement('.DiscordInviteCard--event');
    expect(text(card, '.DiscordInviteCard-heading')).toBe("You've been invited to an event");
    expect(text(card, '.DiscordInviteCard-eventTime')).toBe('Fri, Oct 9, 2026 6:00 PM');
    expect(text(card, '.DiscordInviteCard-eventName')).toBe('Good things come in twos');
    expect(text(card, '.DiscordInviteCard-eventDescription')).toBe('Two releases, one stage.');
    expect(text(card, '.DiscordInviteCard-eventInterested')).toBe('2 interested');
    expect(text(card, '.DiscordInviteCard-eventChannel')).toBe('flarum-stage');
    expect(text(card, '.DiscordInviteCard-name')).toBe('Flarum');
  });

  it('shows the event image when there is one', () => {
    const invite = { ...eventInvite, event: { ...eventInvite.event!, imageUrl: 'https://cdn.discordapp.com/guild-events/1/abc.png?size=512' } };
    const card = mq(m(DiscordInviteCard, { invite }));

    expect(card).toHaveElementAttr('img.DiscordInviteCard-eventImage', 'src', 'https://cdn.discordapp.com/guild-events/1/abc.png?size=512');
  });

  it.each([
    ['active', 'Happening now'],
    ['completed', 'This event has ended'],
    ['canceled', 'This event was cancelled'],
  ] as const)('describes a %s event instead of its start time', (status, label) => {
    const invite = { ...eventInvite, event: { ...eventInvite.event!, status } };
    const card = mq(m(DiscordInviteCard, { invite }));

    expect(text(card, '.DiscordInviteCard-eventTime')).toBe(label);
    expect(card).toHaveElement(`.DiscordInviteCard-eventTime--${status}`);
  });
});

describe('DiscordInviteCard for an invalid invite', () => {
  it('explains that the invite is invalid, without a join button', () => {
    const card = mq(m(DiscordInviteCard, { invite: null }));

    expect(card).toHaveElement('.DiscordInviteCard--invalid');
    expect(text(card, '.DiscordInviteCard-heading')).toBe("You've been invited to join a server, but…");
    expect(text(card, '.DiscordInviteCard-name')).toBe('Invalid Invite');
    expect(text(card, '.DiscordInviteCard-stats')).toBe('This invite may be expired, or you might not have permission to join.');
    expect(card).not.toHaveElement('.DiscordInviteCard-join');
  });
});
