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
            <span className="DiscordInviteCard-name">{guild.name}</span>
            <span className="DiscordInviteCard-stats">{this.stats()}</span>
          </span>
          <span className="Button Button--primary DiscordInviteCard-join">{app.translator.trans('fof-discord-autolink.forum.invite.join')}</span>
        </span>
      </span>
    );
  }

  icon(): Mithril.Children {
    const { guild } = this.attrs.invite;

    return <img className="DiscordInviteCard-icon" src={guild.iconUrl} alt="" loading="lazy" />;
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
