# Changelog

All notable changes to AnvilWiki are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_No changes yet._

## [1.0.0] — 2026-08-13

**AnvilWiki v1.0 — 正式发布 / First stable release.**

This release covers everything since v0.2.0: the full PRD roadmap (v1.1–v2.0) is now ✅, the demo site ships Lighthouse 4×100, and optional features (search, ads, comments, image optimization, skinning CLI) are all production-ready.

### Added
- **Comments system (Giscus, opt-in)**: `Comments.astro` component, env-gated (default off = zero JS, preserves Lighthouse 4×100). Official `<script async data-loading="lazy">` + dual MutationObserver dark-mode sync via postMessage. pathname mapping → different locales get independent threads. `data-lang` follows page locale. See `docs/comments.md`.
- Image `decoding="async"` + explicit `width`/`height` to prevent CLS (ListPage covers, VideoSection thumbnails)
- FAQ accessibility: `aria-expanded` sync on toggle + `data-faq-group` container
- WikiSidebar now visible on tablet (md breakpoint, was lg-only)
- Migration cost breakdown in `docs/migration-from-nextjs.md` (2-hour estimate per site)

### Changed
- PRD status updated: "设计中 · 待 review" → "已实现"
- PRD §14.2: v1.1 (seoscout converter) marked as done
- PRD §14.2: v1.4 (Giscus comments) marked as done — `Comments.astro` env-gated, default off
- AGENTS.md: Hard Rule 9 now requires `SITE_URL` to include `https://` protocol (bare domain fails Astro build with `Invalid url`)
- AGENTS.md: added Hard Rule 11 (comments env-empty = null render contract)
- AGENTS.md: added Hard Rule 12 (`wrangler.toml` 接管 Cloudflare Pages env — dashboard env vars ignored when this file exists)
- Demo `home.hero.videoId` cleared (was placeholder)

### Fixed
- **Cloudflare Pages env injection**: `wrangler.toml` was missing the `[vars]` section, so the build process received ZERO env vars (including `SITE_URL` and all `PUBLIC_GISCUS_*`). Root cause: when `wrangler.toml` exists for a Pages project, it becomes the sole source of truth and the dashboard's "Environment variables" UI is ignored ([Cloudflare docs](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)). Fix: declare all build-time env vars in `[vars]`. This bug was previously masked because `process.env.SITE_URL || 'https://...'` fallback in `astro.config.ts` covered for the missing env.
- **`SITE_URL` protocol requirement**: now enforced — bare domain `anvilwiki.pages.dev` fails Astro build with `Invalid url`. `.env.example` was already correct (`https://...`), but the Cloudflare dashboard config had a bare domain. Documented in AGENTS.md Hard Rule 9 + `docs/deployment.md`.

## [0.2.0] — 2026-08-12

### Added
- `scripts/check-sitemap.ts` — verifies every sitemap URL returns 200
- `scripts/new-post.ts` — interactive MDX article scaffold
- `scripts/convert-from-seoscout.ts` — converts seoscout MDX format to YAML frontmatter
- ESLint flat config (`eslint.config.js`) + Prettier config (`.prettierrc` + `.prettierignore`)
- `VideoSection` component — lazy-loaded YouTube embed (zero JS until click)
- `WikiSidebar` component — dynamic article navigation (auto-generated from MDX files)
- `TrendingNow` component — horizontal scroll-snap card row
- `InContentAd` component — page-internal ad slot
- Ad integration: `StickyBanner` in LocaleLayout, `SidebarAd` in WikiSidebar, `InContentAd` in ArticlePage
- Google Analytics + Search Console verification injection (env-var gated)
- CI workflow (`.github/workflows/ci.yml`) — lint + typecheck + build on every PR
- Issue templates (bug report + feature request) and PR template
- `CONTRIBUTING.md`
- `wrangler.toml` for local Cloudflare preview

## [0.1.0] — 2026-08-11

### Added
- Initial public release
- Astro 5 static site (`output: 'static'`, zero adapter, Cloudflare Pages native)
- Content Layer API + Zod schema for type-safe MDX articles
- i18n: as-needed prefix (English no prefix, others prefixed) with single-article English fallback
- Homepage: 8 JSON-driven modules with 4 displayTypes (code-cards / step-by-step / tier-grid / card-list)
- SEO: Organization / WebSite / Article / BreadcrumbList / ItemList / FAQPage JSON-LD, hreflang, dynamic sitemap, robots.txt
- Theme: CSS variable skinning (4 lines to reskin) + dark mode with no-FOUC
- Ads: Adsterra iframe isolation (6 slots), Sticky 320×50 with dismiss button, env-var gated
- Legal pages: about / privacy-policy / terms-of-service / copyright
- Demo content: fictional "Anvil Quest" game (5 MDX articles, en + ja)
- Docs: PRD (1600+ lines), deployment, skinning (4-phase 7-part), content-format, seo, ads, migration-from-nextjs
- Build: 27 pages, typecheck 0 errors

[Unreleased]: https://github.com/PNGTRID/AnvilWiki/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/PNGTRID/AnvilWiki/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/PNGTRID/AnvilWiki/releases/tag/v0.1.0
