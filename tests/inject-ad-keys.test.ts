import { describe, it, expect } from 'vitest';
import { readdir } from 'node:fs/promises';
import { injectKey, SLOT_MAPPING } from '../scripts/inject-ad-keys';

/**
 * Tests for the build-time Adsterra key injection script.
 *
 * The mapping-completeness test is the DRY drift guard: it locks
 * scripts/inject-ad-keys.ts and public/ads/*.html together, so adding an ad
 * slot without wiring its mapping (or vice versa) fails CI instead of
 * silently shipping a placeholder ad.
 */

// Modeled on public/ads/*.html — the placeholder appears twice:
// once as atOptions.key, once inside the invoke.js URL.
const SNIPPET = `atOptions = {
  key: 'YOUR_AD_KEY',
  format: 'iframe',
  height: 50,
  width: 320,
  params: {},
};
<script src="//www.highperformanceformat.com/YOUR_AD_KEY/invoke.js"></script>`;

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe('injectKey', () => {
  it('replaces every YOUR_AD_KEY occurrence (atOptions + invoke.js URL)', () => {
    const result = injectKey(SNIPPET, 'acd3f5g7h8j9k');
    expect(result).not.toContain('YOUR_AD_KEY');
    expect(countOccurrences(result, 'acd3f5g7h8j9k')).toBe(2);
  });

  it('returns the html unchanged for an empty key', () => {
    expect(injectKey(SNIPPET, '')).toBe(SNIPPET);
  });

  it('is safe for keys containing regex-special characters', () => {
    const tricky = 'a$b.c+d(e)f*g';
    const result = injectKey(SNIPPET, tricky);
    expect(result).not.toContain('YOUR_AD_KEY');
    expect(countOccurrences(result, tricky)).toBe(2);
  });
});

describe('SLOT_MAPPING completeness', () => {
  it('maps every public/ads/*.html file exactly once, and only existing files', async () => {
    const adsDir = new URL('../public/ads/', import.meta.url);
    const onDisk = (await readdir(adsDir)).filter((f) => f.endsWith('.html')).sort();
    const mapped = Object.values(SLOT_MAPPING).sort();

    expect(onDisk).toEqual(mapped);
  });
});
