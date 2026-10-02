import app from 'flarum/forum/app';
import dayjs from 'dayjs';
import flatten from 'flat';
import jsYaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

/**
 * Load this extension's real English translations, so tests also catch
 * missing or mistyped keys.
 */
export function loadTranslations(): void {
  // Jest runs from the extension's js/ directory.
  const file = path.join(process.cwd(), '..', 'locale', 'en.yml');

  app.translator.addTranslations(flatten(jsYaml.load(fs.readFileSync(file, 'utf8')) as object));
}

/**
 * In the browser, Flarum exposes dayjs as a global; @flarum/jest-config does not.
 */
export function exposeDayjs(): void {
  (globalThis as any).dayjs = dayjs;
}
