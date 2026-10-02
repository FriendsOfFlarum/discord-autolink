import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import app from 'flarum/forum/app';
import { afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import hydrateDiscordEmbeds from '../../src/forum/utils/hydrateDiscordEmbeds';
import { clearInviteCache } from '../../src/forum/utils/fetchInvite';
import type { DiscordInvite } from '../../src/forum/types';
import { exposeDayjs, loadTranslations } from '../helpers';

const invite: DiscordInvite = {
  code: 'G8MGEsC53',
  url: 'https://discord.gg/G8MGEsC53',
  guild: {
    id: '360670804914208769',
    name: 'Flarum',
    description: null,
    iconUrl: null,
    memberCount: 547,
    onlineCount: 98,
    verified: false,
    partnered: false,
  },
  channel: { name: 'devs' },
  event: null,
};

/**
 * Server-rendered post HTML, as the formatter produces it.
 */
function post(html: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'Post-body';
  el.innerHTML = html;
  document.body.appendChild(el);

  return el;
}

const inviteLink = (code: string, event?: string) =>
  `<a class="DiscordEmbed DiscordEmbed--invite" target="_blank" rel="ugc noopener noreferrer" href="https://discord.gg/${code}${event ? `?event=${event}` : ''}" data-discord-invite="${code}"${event ? ` data-discord-event="${event}"` : ''}><i class="fab fa-discord" aria-hidden="true"></i><span class="DiscordEmbed-label">discord.gg/${code}</span></a>`;

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Stand in for the forum's own API, the boundary between this code and the backend.
 */
function apiResponds(respond: (url: string, params: Record<string, string>) => Promise<unknown>) {
  return jest.spyOn(app, 'request').mockImplementation(((options: any) => respond(options.url, options.params || {})) as any);
}

beforeAll(() => {
  exposeDayjs();
  bootstrapForum({
    resources: [{ type: 'forums', id: '1', attributes: { apiUrl: 'https://forum.test/api' } }],
  });
  app.boot();
  loadTranslations();
});

afterEach(() => {
  jest.restoreAllMocks();
  clearInviteCache();
  document.body.innerHTML = '';
});

describe('hydrateDiscordEmbeds', () => {
  it('upgrades an invite link to a card, keeping the link itself', async () => {
    const request = apiResponds(async () => invite);
    const root = post(`Join us: ${inviteLink('G8MGEsC53')}`);

    hydrateDiscordEmbeds(root);
    await settle();

    const link = root.querySelector('a.DiscordEmbed')!;
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatchObject({ method: 'GET', url: 'https://forum.test/api/discord/invites/G8MGEsC53' });
    expect(link.classList.contains('DiscordEmbed--card')).toBe(true);
    expect(link.getAttribute('href')).toBe('https://discord.gg/G8MGEsC53');
    expect(link.querySelector('.DiscordInviteCard-name')!.textContent).toBe('Flarum');
    expect(link.querySelector('.DiscordInviteCard-online')!.textContent).toBe('98 Online');
  });

  it('passes the event through for event invites', async () => {
    const request = apiResponds(async () => invite);
    const root = post(inviteLink('te7dMZm8', '1555683235751792691'));

    hydrateDiscordEmbeds(root);
    await settle();

    expect(request.mock.calls[0][0]).toMatchObject({
      url: 'https://forum.test/api/discord/invites/te7dMZm8',
      params: { event: '1555683235751792691' },
    });
  });

  it('looks each invite up once, however often it appears or is hydrated', async () => {
    const request = apiResponds(async () => invite);
    const root = post(`${inviteLink('G8MGEsC53')} and again ${inviteLink('G8MGEsC53')}`);

    hydrateDiscordEmbeds(root);
    hydrateDiscordEmbeds(root);
    await settle();

    expect(request).toHaveBeenCalledTimes(1);
    expect(root.querySelectorAll('.DiscordInviteCard')).toHaveLength(2);
  });

  it('shows the invalid invite card when the invite is unknown', async () => {
    apiResponds(() => Promise.reject({ status: 404 }));
    const root = post(inviteLink('expired123'));

    hydrateDiscordEmbeds(root);
    await settle();

    expect(root.querySelector('.DiscordInviteCard--invalid')).not.toBeNull();
  });

  it('leaves the plain link alone when the lookup fails for another reason', async () => {
    apiResponds(() => Promise.reject({ status: 502 }));
    const root = post(inviteLink('G8MGEsC53'));

    hydrateDiscordEmbeds(root);
    await settle();

    expect(root.querySelector('.DiscordInviteCard')).toBeNull();
    expect(root.querySelector('.DiscordEmbed-label')!.textContent).toBe('discord.gg/G8MGEsC53');
    expect(root.querySelector('a')!.classList.contains('DiscordEmbed--card')).toBe(false);
  });

  it('labels channel, message and event chips without asking the API', () => {
    const request = apiResponds(async () => invite);
    const chip = (type: string) =>
      `<a class="DiscordEmbed DiscordEmbed--${type}" href="#"><i class="fab fa-discord"></i><span class="DiscordEmbed-label" data-discord-label="${type}"></span></a>`;
    const root = post(chip('channel') + chip('message') + chip('event'));

    hydrateDiscordEmbeds(root);

    const labels = Array.from(root.querySelectorAll('.DiscordEmbed-label')).map((el) => el.textContent);
    expect(labels).toEqual(['Discord channel', 'Discord message', 'Discord event']);
    expect(request).not.toHaveBeenCalled();
  });
});
