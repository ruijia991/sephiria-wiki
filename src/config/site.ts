/**
 * Site configuration — the single source of truth for game-specific metadata.
 *
 * 👉 SKINNING: Change every field here when building a new game wiki.
 * This is part of the CONFIG LAYER — framework code reads from here, never the reverse.
 */

export interface SiteConfig {
  /** Full site name, used in <title> suffix and Organization JSON-LD. e.g. "Anvil Quest Wiki" */
  name: string;
  /** Short name for PWA manifest and mobile logo. e.g. "AQ Wiki" */
  shortName: string;
  /** Site description for Organization JSON-LD and og:site_name. */
  description: string;
  /** Domain without protocol or trailing slash. e.g. "anvilquestwiki.wiki" */
  domain: string;
  /** Hero tagline shown under the site title. */
  tagline: string;
  /** Copyright / legal disclaimer line shown in footer. */
  legalNotice: string;
  social: {
    /** Official game website URL (the game itself, not the wiki). */
    official: string;
    discord?: string;
    youtube?: string;
    twitter?: string;
    reddit?: string;
  };
  game: {
    /** Full game name. */
    name: string;
    /** Platform: "Roblox" | "Steam" | "Epic Games" | "Mobile" | ... */
    platform: string;
    /** Developer / studio name. */
    developer: string;
    /** Genre description. */
    genre: string;
    /** ISO release date (optional). */
    releaseDate?: string;
  };
  /**
   * Dimensions of the default OG/Twitter share image (public/images/hero.webp).
   * Emitted as og:image:width / og:image:height so social crawlers can render
   * the share card without downloading the image first.
   */
  ogImageWidth: number;
  ogImageHeight: number;
}

export const site: SiteConfig = {
  name: 'Sephiria Wiki',
  shortName: 'SPW',
  description:
    'Complete Sephiria wiki with weapon tier lists, builds, secret rooms, constellation locations, co-op guides, and achievements. Updated for 1.0.',
  domain: 'sephiria.cfd',
  tagline: 'Your tower guide for everything Sephiria',
  legalNotice:
    'Sephiria Wiki is a fan-made community site. Not affiliated with or endorsed by TEAM HORAY.',
  social: {
    official: 'https://store.steampowered.com/app/2436940/Sephiria/',
    reddit: 'https://www.reddit.com/r/sephiria/',
  },
  game: {
    name: 'Sephiria',
    platform: 'Steam',
    developer: 'TEAM HORAY',
    genre: 'Action Roguelite',
    releaseDate: '2026-07-31',
  },
  // hero.webp is 1200×630 (the recommended OG share aspect ratio).
  ogImageWidth: 1200,
  ogImageHeight: 630,
};

/** Absolute site URL (no trailing slash). Falls back to the Astro `site` config. */
export const siteUrl: string = (process.env.SITE_URL || `https://${site.domain}`).replace(
  /\/$/,
  '',
);
