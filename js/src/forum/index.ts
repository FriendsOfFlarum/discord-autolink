import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import ComposerPostPreview from 'flarum/forum/components/ComposerPostPreview';
import hydrateDiscordEmbeds from './utils/hydrateDiscordEmbeds';

app.initializers.add('fof-discord-autolink', () => {
  // A post's HTML is replaced whenever it changes (e.g. after an edit), so
  // hydrate on every update; already-hydrated links are skipped.
  extend(CommentPost.prototype, 'oncreate', function () {
    hydrateDiscordEmbeds(this.element);
  });

  extend(CommentPost.prototype, 'onupdate', function () {
    hydrateDiscordEmbeds(this.element);
  });

  // The preview is re-rendered by TextFormatter outside of Mithril's lifecycle,
  // so watch its DOM instead.
  extend(ComposerPostPreview.prototype, 'oncreate', function (this: ComposerPostPreview & { discordObserver?: MutationObserver }) {
    const el = this.element;

    this.discordObserver = new MutationObserver(() => hydrateDiscordEmbeds(el));
    this.discordObserver.observe(el, { childList: true, subtree: true });

    hydrateDiscordEmbeds(el);
  });

  extend(ComposerPostPreview.prototype, 'onremove', function (this: ComposerPostPreview & { discordObserver?: MutationObserver }) {
    this.discordObserver?.disconnect();
  });
});
