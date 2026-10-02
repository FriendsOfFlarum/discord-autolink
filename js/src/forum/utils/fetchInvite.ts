import app from 'flarum/forum/app';
import type { DiscordInvite } from '../types';

const cache = new Map<string, Promise<DiscordInvite | null>>();

/**
 * Fetch an invite's card data from the forum, once per page load per invite.
 *
 * Resolves to null when Discord does not know the invite. Rejects when the
 * lookup failed for any other reason (Discord down, throttled, offline).
 */
export default function fetchInvite(code: string, event?: string | null): Promise<DiscordInvite | null> {
  const key = `${code}:${event || ''}`;

  if (!cache.has(key)) {
    cache.set(
      key,
      app
        .request<DiscordInvite>({
          method: 'GET',
          url: `${app.forum.attribute('apiUrl')}/discord/invites/${encodeURIComponent(code)}`,
          params: event ? { event } : {},
          // Cards are an enhancement: a failed lookup leaves the plain link, never an alert.
          errorHandler: () => {},
        })
        .catch((error) => {
          if (error?.status === 404) return null;

          // Let a later render retry rather than remembering a transient failure.
          cache.delete(key);
          throw error;
        })
    );
  }

  return cache.get(key)!;
}

export function clearInviteCache(): void {
  cache.clear();
}
