import { describe, it, expect } from 'vitest';
import {
  localizePath,
  listPath,
  detailPath,
  homeUrl,
  localeFromPath,
} from '~/lib/url';

describe('url helpers', () => {
  describe('localizePath', () => {
    it('returns the path unchanged for the default locale (en)', () => {
      expect(localizePath('/bosses', 'en')).toBe('/bosses');
      expect(localizePath('/bosses/gelum', 'en')).toBe('/bosses/gelum');
    });

    it('ensures leading slash on input without one', () => {
      expect(localizePath('about', 'en')).toBe('/about');
    });
  });

  describe('homeUrl', () => {
    it('returns / for default locale', () => {
      expect(homeUrl('en')).toBe('/');
    });
  });

  describe('listPath', () => {
    it('builds the correct list URL for each locale', () => {
      expect(listPath('bosses', 'en')).toBe('/bosses');
      expect(listPath('codes', 'en')).toBe('/codes');
    });
  });

  describe('detailPath', () => {
    it('builds the correct article URL for each locale', () => {
      expect(detailPath('bosses', 'gelum', 'en')).toBe('/bosses/gelum');
    });

    it('handles nested slugs', () => {
      expect(detailPath('guides', 'early-game/beginner', 'en')).toBe(
        '/guides/early-game/beginner',
      );
    });
  });

  describe('localeFromPath', () => {
    it('falls back to the default locale for prefixes that are not configured locales', () => {
      // 'ja' was removed from the locales config (en-only site), so a /ja/
      // prefix is no longer a locale and must resolve to the default.
      expect(localeFromPath('/ja/bosses/gelum')).toBe('en');
      expect(localeFromPath('/ja')).toBe('en');
    });

    it('returns the default locale when no prefix is present', () => {
      expect(localeFromPath('/bosses/gelum')).toBe('en');
      expect(localeFromPath('/')).toBe('en');
      expect(localeFromPath('')).toBe('en');
    });
  });
});
