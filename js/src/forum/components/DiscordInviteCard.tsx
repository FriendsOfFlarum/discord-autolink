import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import formatNumber from 'flarum/common/utils/formatNumber';
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
  view() {
    if (!this.attrs.invite) return this.invalid();

    const { guild, event } = this.attrs.invite;

    return (
      <span className={event ? 'DiscordInviteCard DiscordInviteCard--event' : 'DiscordInviteCard'}>
        <span className="DiscordInviteCard-heading">
          {app.translator.trans(event ? 'fof-discord-autolink.forum.event.heading' : 'fof-discord-autolink.forum.invite.heading')}
        </span>
        {event && this.event(event)}
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

  invalid(): Mithril.Children {
    return (
      <span className="DiscordInviteCard DiscordInviteCard--invalid">
        <span className="DiscordInviteCard-heading">{app.translator.trans('fof-discord-autolink.forum.invite.invalid_heading')}</span>
        <span className="DiscordInviteCard-body">
          <span className="DiscordInviteCard-icon DiscordInviteCard-icon--invalid" aria-hidden="true">
            <i className="fas fa-times" />
          </span>
          <span className="DiscordInviteCard-info">
            <span className="DiscordInviteCard-name">{app.translator.trans('fof-discord-autolink.forum.invite.invalid_title')}</span>
            <span className="DiscordInviteCard-stats">{app.translator.trans('fof-discord-autolink.forum.invite.invalid_text')}</span>
          </span>
        </span>
      </span>
    );
  }

  event(event: DiscordEvent): Mithril.Children {
    return (
      <span className="DiscordInviteCard-event">
        {event.imageUrl && <img className="DiscordInviteCard-eventImage" src={event.imageUrl} alt="" loading="lazy" />}
        {this.eventTime(event)}
        <span className="DiscordInviteCard-eventName">{event.name}</span>
        {event.description && <span className="DiscordInviteCard-eventDescription">{event.description}</span>}
        <span className="DiscordInviteCard-eventMeta">
          {event.channelName && (
            <span className="DiscordInviteCard-eventChannel">
              <i className="fas fa-microphone" aria-hidden="true" />
              {event.channelName}
            </span>
          )}
          {event.interestedCount !== null && (
            <span className="DiscordInviteCard-eventInterested">
              <i className="fas fa-user-friends" aria-hidden="true" />
              {app.translator.trans('fof-discord-autolink.forum.event.interested', { count: formatNumber(event.interestedCount) })}
            </span>
          )}
        </span>
      </span>
    );
  }

  eventTime(event: DiscordEvent): Mithril.Children {
    const status = event.status || 'scheduled';

    const label =
      status === 'scheduled'
        ? event.startsAt && (
            <time datetime={event.startsAt} title={dayjs(event.startsAt).format('LLLL')}>
              {dayjs(event.startsAt).format('llll')}
            </time>
          )
        : app.translator.trans(`fof-discord-autolink.forum.event.${status}`);

    return (
      <span className={`DiscordInviteCard-eventTime DiscordInviteCard-eventTime--${status}`}>
        <i className={status === 'active' ? 'fas fa-broadcast-tower' : 'far fa-calendar'} aria-hidden="true" />
        {label}
      </span>
    );
  }

  icon(): Mithril.Children {
    const { guild } = this.attrs.invite!;

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
    const { guild } = this.attrs.invite!;
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
    const { guild } = this.attrs.invite!;

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
