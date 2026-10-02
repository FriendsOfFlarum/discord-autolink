import app from 'flarum/forum/app';
import type { DiscordInvite } from '../types';

const cache = new Map<string, Promise<DiscordInvite>>();

/**
 * Fetch an invite's card data from the forum, once per page load per invite.
 */
export default function fetchInvite(code: string, event?: string | null): Promise<DiscordInvite> {
  const key = `${code}:${event || ''}`;

  if (!cache.has(key)) {
    cache.set(
      key,
      app.request<DiscordInvite>({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/discord/invites/${encodeURIComponent(code)}`,
        params: event ? { event } : {},
        // Cards are an enhancement: a failed lookup leaves the plain link, never an alert.
        errorHandler: () => {},
      })
    );
  }

  return cache.get(key)!;
}

export function clearInviteCache(): void {
  cache.clear();
}
