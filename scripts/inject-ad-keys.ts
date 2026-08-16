/**
 * inject-ad-keys.ts
 *
 * Build-time Adsterra key injection. The ad components gate rendering on
 * PUBLIC_AD_* env vars, but the actual ad HTML lives in public/ads/*.html —
 * static files Astro never processes. This script runs after `astro build`
 * and replaces every YOUR_AD_KEY placeholder in dist/ads/*.html with the key
 * from the matching env var, so keys stay config-driven (wrangler.toml
 * [vars]) instead of hardcoded in the repo.
 *
 * Usage (wired into package.json postbuild):
 *   pnpm build                                    # runs automatically
 *   pnpm tsx scripts/inject-ad-keys.ts [adsDir]   # standalone, default dist/ads
 *
 * Empty/missing key → file left untouched; the ad component renders nothing
 * for that slot anyway. Ads never break the build.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * env var → dist/ads file. Keep in sync with public/ads/*.html and the
 * env vars consumed by src/components/ads/* — the mapping-completeness
 * test in tests/inject-ad-keys.test.ts guards against drift.
 */
export const SLOT_MAPPING: Record<string, string> = {
  PUBLIC_AD_MOBILE_320X50: 'banner-320x50.html',
  PUBLIC_AD_SIDEBAR_160X300: 'sidebar-160x300.html',
  PUBLIC_AD_SIDEBAR_160X600: 'sidebar-160x600.html',
  PUBLIC_AD_BANNER_728X90: 'banner-728x90.html',
  PUBLIC_AD_BANNER_300X250: 'banner-300x250.html',
  PUBLIC_AD_BANNER_468X60: 'banner-468x60.html',
};

const PLACEHOLDER = 'YOUR_AD_KEY';

/**
 * Replace every placeholder occurrence with the real key. Plain string
 * split/join (no regex) so keys containing special characters are safe.
 */
export function injectKey(html: string, key: string): string {
  if (!key) return html;
  return html.split(PLACEHOLDER).join(key);
}

export async function main(adsDir = 'dist/ads'): Promise<void> {
  // Local runs: pick up keys from .env if present. In CI / Cloudflare Pages
  // builds there is no .env file (gitignored) — real env vars are the source.
  try {
    process.loadEnvFile();
  } catch {
    // no .env file — fine
  }

  let files: string[];
  try {
    files = await readdir(adsDir);
  } catch {
    console.warn(`[ads] ${adsDir} not found — nothing to inject (run astro build first)`);
    return;
  }

  // Drift guard: warn when dist/ads contains files this script doesn't map.
  const mappedFiles = new Set(Object.values(SLOT_MAPPING));
  for (const f of files) {
    if (f.endsWith('.html') && !mappedFiles.has(f)) {
      console.warn(`[ads] no SLOT_MAPPING entry for ${f} — it will keep its placeholder`);
    }
  }

  for (const [envVar, file] of Object.entries(SLOT_MAPPING)) {
    const key = process.env[envVar];
    if (!key) {
      console.log(`[ads] ${file}: skipped (${envVar} empty — ad slot disabled)`);
      continue;
    }
    let html: string;
    try {
      html = await readFile(`${adsDir}/${file}`, 'utf8');
    } catch {
      console.warn(`[ads] ${file} listed in SLOT_MAPPING but missing from ${adsDir}`);
      continue;
    }
    if (!html.includes(PLACEHOLDER)) {
      console.log(`[ads] ${file}: already injected — skipped`);
      continue;
    }
    await writeFile(`${adsDir}/${file}`, injectKey(html, key), 'utf8');
    console.log(`[ads] ${file}: injected key from ${envVar}`);
  }
}

// Run only when executed directly (not when imported by tests).
const invoked = process.argv[1];
if (invoked && import.meta.url === pathToFileURL(realpathSync(invoked)).href) {
  await main(process.argv[2]);
}
