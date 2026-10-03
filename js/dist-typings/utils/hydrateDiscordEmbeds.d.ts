/**
 * Upgrade the server-rendered Discord links inside `root`: invite links become
 * rich cards, and channel/message/event chips get a translated label.
 *
 * Safe to call repeatedly on the same content: links already upgraded are skipped.
 */
export default function hydrateDiscordEmbeds(root: ParentNode): void;
