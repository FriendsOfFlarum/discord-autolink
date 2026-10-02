import app from 'flarum/forum/app';
import m from 'mithril';
import DiscordInviteCard from '../components/DiscordInviteCard';
import fetchInvite from './fetchInvite';

const LABELS = ['channel', 'message', 'event'];

/**
 * Upgrade the server-rendered Discord links inside `root`: invite links become
 * rich cards, and channel/message/event chips get a translated label.
 *
 * Safe to call repeatedly on the same content: links already upgraded are skipped.
 */
export default function hydrateDiscordEmbeds(root: ParentNode): void {
  // The formatter cannot translate, so it leaves these labels empty for us to fill.
  root.querySelectorAll<HTMLElement>('[data-discord-label]:empty').forEach((label) => {
    const type = label.getAttribute('data-discord-label')!;

    if (LABELS.includes(type)) {
      label.textContent = app.translator.trans(`fof-discord-autolink.forum.label.${type}`, {}, true);
    }
  });

  root.querySelectorAll<HTMLAnchorElement>('a[data-discord-invite]:not([data-discord-hydrated])').forEach((link) => {
    link.setAttribute('data-discord-hydrated', 'loading');

    fetchInvite(link.getAttribute('data-discord-invite')!, link.getAttribute('data-discord-event')).then(
      (invite) => {
        // Render into a fresh element each time: the link's children may have been
        // replaced underneath us (e.g. by the composer preview) since the last render.
        const host = document.createElement('span');
        m.render(host, m(DiscordInviteCard, { invite }));

        link.replaceChildren(host);
        link.classList.add('DiscordEmbed--card');
        link.setAttribute('data-discord-hydrated', 'done');
      },
      () => {
        // Keep the plain link; it still works.
        link.setAttribute('data-discord-hydrated', 'failed');
      }
    );
  });
}
