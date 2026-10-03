import Component from 'flarum/common/Component';
import type { ComponentAttrs } from 'flarum/common/Component';
import type Mithril from 'mithril';
import type { DiscordEvent, DiscordInvite } from '../types';
export interface DiscordInviteCardAttrs extends ComponentAttrs {
    /** Null when Discord does not know the invite: it expired, was revoked or never existed. */
    invite: DiscordInvite | null;
}
/**
 * The rich card a Discord invite link is upgraded to. It renders inside the
 * link itself, so it is built from spans and holds no interactive elements.
 */
export default class DiscordInviteCard extends Component<DiscordInviteCardAttrs> {
    view(): Mithril.Children | JSX.Element;
    invalid(): Mithril.Children;
    event(event: DiscordEvent): Mithril.Children;
    eventTime(event: DiscordEvent): Mithril.Children;
    icon(): Mithril.Children;
    badge(): Mithril.Children;
    stats(): Mithril.Children;
}
