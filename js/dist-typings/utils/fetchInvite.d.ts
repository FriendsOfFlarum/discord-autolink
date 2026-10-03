import type { DiscordInvite } from '../types';
/**
 * Fetch an invite's card data from the forum, once per page load per invite.
 *
 * Resolves to null when Discord does not know the invite. Rejects when the
 * lookup failed for any other reason (Discord down, throttled, offline).
 */
export default function fetchInvite(code: string, event?: string | null): Promise<DiscordInvite | null>;
export declare function clearInviteCache(): void;
