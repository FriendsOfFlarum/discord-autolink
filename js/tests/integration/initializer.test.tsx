import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import app from 'flarum/forum/app';
import CommentPost from 'flarum/forum/components/CommentPost';
import ComposerPostPreview from 'flarum/forum/components/ComposerPostPreview';
import m from 'mithril';
import { afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import '../../src/forum';
import { clearInviteCache } from '../../src/forum/utils/fetchInvite';
import { exposeDayjs, loadTranslations } from '../helpers';

const inviteHtml =
  '<a class="DiscordEmbed DiscordEmbed--invite" target="_blank" rel="ugc noopener noreferrer" href="https://discord.gg/G8MGEsC53" data-discord-invite="G8MGEsC53"><i class="fab fa-discord" aria-hidden="true"></i><span class="DiscordEmbed-label">discord.gg/G8MGEsC53</span></a>';

const invite = {
  code: 'G8MGEsC53',
  url: 'https://discord.gg/G8MGEsC53',
  guild: { id: '1', name: 'Flarum', description: null, iconUrl: null, memberCount: 547, onlineCount: 98, verified: false, partnered: false },
  channel: null,
  event: null,
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function mount(view: () => Mithril.Children): HTMLElement {
  const root = document.createElement('div');
  document.body.appendChild(root);
  m.mount(root, { view });

  return root;
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

describe('the forum initializer', () => {
  it('upgrades invite links in rendered posts', async () => {
    jest.spyOn(app, 'request').mockImplementation((async () => invite) as any);

    app.store.pushPayload({
      data: {
        type: 'posts',
        id: '1',
        attributes: { number: 1, contentType: 'comment', contentHtml: `<p>Join us: ${inviteHtml}</p>`, createdAt: '2026-10-03T12:00:00+00:00' },
        relationships: {
          discussion: { data: { type: 'discussions', id: '1' } },
          user: { data: { type: 'users', id: '1' } },
        },
      },
      included: [{ type: 'discussions', id: '1', attributes: { title: 'Discord', slug: '1-discord' } }],
    });
    const post = app.store.getById('posts', '1');

    const root = mount(() => m(CommentPost as any, { post }));
    await settle();

    expect(root.querySelector('.Post-body .DiscordInviteCard-name')?.textContent).toBe('Flarum');
  });

  it('upgrades invite links in the live composer preview as the user types', async () => {
    jest.spyOn(app, 'request').mockImplementation((async () => invite) as any);

    // Stand in for TextFormatter's browser-side renderer, which jsdom does not load.
    (globalThis as any).s9e = { TextFormatter: { preview: (text: string, el: HTMLElement) => (el.innerHTML = text) } };

    let content = 'Hello';
    const composer = { isVisible: () => true, fields: { content: () => content } };
    const root = mount(() => m(ComposerPostPreview as any, { composer, className: 'Preview' }));

    content = `Join us: ${inviteHtml}`;
    await new Promise((resolve) => setTimeout(resolve, 80));
    await settle();

    expect(root.querySelector('.Preview .DiscordInviteCard-name')?.textContent).toBe('Flarum');

    m.mount(root, null);
  });
});
