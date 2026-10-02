import m from 'mithril';
import DiscordInviteCard from '../components/DiscordInviteCard';
import fetchInvite from './fetchInvite';

/**
 * Upgrade the server-rendered Discord invite links inside `root` to rich cards.
 *
 * Safe to call repeatedly on the same content: links already being upgraded are skipped.
 */
export default function hydrateDiscordEmbeds(root: ParentNode): void {
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
