import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import formatNumber from 'flarum/common/utils/formatNumber';
import type { ComponentAttrs } from 'flarum/common/Component';
import type Mithril from 'mithril';
import type { DiscordInvite } from '../types';

export interface DiscordInviteCardAttrs extends ComponentAttrs {
  invite: DiscordInvite;
}

/**
 * The rich card a Discord invite link is upgraded to. It renders inside the
 * link itself, so it is built from spans and holds no interactive elements.
 */
export default class DiscordInviteCard extends Component<DiscordInviteCardAttrs> {
  view() {
    const { guild } = this.attrs.invite;

    return (
      <span className="DiscordInviteCard">
        <span className="DiscordInviteCard-heading">{app.translator.trans('fof-discord-autolink.forum.invite.heading')}</span>
        <span className="DiscordInviteCard-body">
          {this.icon()}
          <span className="DiscordInviteCard-info">
            <span className="DiscordInviteCard-name">
              {this.badge()}
              {guild.name}
            </span>
            <span className="DiscordInviteCard-stats">{this.stats()}</span>
          </span>
          <span className="Button Button--primary DiscordInviteCard-join">{app.translator.trans('fof-discord-autolink.forum.invite.join')}</span>
        </span>
      </span>
    );
  }

  icon(): Mithril.Children {
    const { guild } = this.attrs.invite;

    if (guild.iconUrl) {
      return <img className="DiscordInviteCard-icon" src={guild.iconUrl} alt="" loading="lazy" />;
    }

    // Like Discord, stand in for a missing icon with the server's initials.
    const acronym = (guild.name || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => Array.from(word)[0])
      .join('')
      .slice(0, 5);

    return (
      <span className="DiscordInviteCard-icon DiscordInviteCard-icon--acronym" aria-hidden="true">
        {acronym}
      </span>
    );
  }

  badge(): Mithril.Children {
    const { guild } = this.attrs.invite;
    const type = guild.verified ? 'verified' : guild.partnered ? 'partnered' : null;

    if (!type) return null;

    const label = app.translator.trans(`fof-discord-autolink.forum.invite.${type}`, {}, true);

    return (
      <span className={`DiscordInviteCard-badge DiscordInviteCard-badge--${type}`} title={label} aria-label={label}>
        <i className={type === 'verified' ? 'fas fa-check' : 'fas fa-infinity'} aria-hidden="true" />
      </span>
    );
  }

  stats(): Mithril.Children {
    const { guild } = this.attrs.invite;

    return [
      guild.onlineCount !== null && (
        <span className="DiscordInviteCard-online">
          <span className="DiscordInviteCard-dot" aria-hidden="true" />
          {app.translator.trans('fof-discord-autolink.forum.invite.online', { count: formatNumber(guild.onlineCount) })}
        </span>
      ),
      guild.memberCount !== null && (
        <span className="DiscordInviteCard-members">
          <span className="DiscordInviteCard-dot" aria-hidden="true" />
          {app.translator.trans('fof-discord-autolink.forum.invite.members', { count: formatNumber(guild.memberCount) })}
        </span>
      ),
    ];
  }
}
