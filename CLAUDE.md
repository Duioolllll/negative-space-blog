# CLAUDE.md

Personal Korean blog "Negative Space". React 19 + TanStack Start (SSR) + Tailwind v4, deployed as ONE Cloudflare Worker (`wrangler.jsonc`), D1 for newsletter subscribers.

## Commands
- `bun install`
- `bun run typecheck` (also regenerates content) and `bun run build` must pass before any commit.
- `bun run preview` = build + `wrangler dev` on :8787 (needs `bun run db:migrate:local` once). Prefer this over `bun run dev` for anything touching D1.
- `bun run sync:notion` needs `NOTION_TOKEN` and `NOTION_DATABASE_ID`.

## How content works
- Source of truth: `content/posts/*.md` (frontmatter: title, slug, date YYYY-MM-DD, topic, dek, image, minutes, featured, draft, source).
- `scripts/build-content.mjs` compiles them into `src/generated/posts.json` (metadata, shipped to browser) and `src/generated/bodies.json` (HTML, server only via `getPostBody` server fn). `src/generated/` is gitignored; never edit it.
- Frame numbers ("00A", "01A"...) are assigned by date order at build time.
- Notion posts are written by `scripts/sync-notion.mjs` with `source: notion`; the sync deletes Notion files that are unpublished, so don't hand-edit those files (edit in Notion).
- Topics are fixed: writing, code, design, photo, reading, notes (`src/lib/blog/posts.ts`).

## Rules
- SSR-safe: no `window`/`document` at module top level or during render; only in effects/handlers.
- Scroll motion writes CSS variables directly (`use-scroll-progress.ts`); never per-frame React state. Every animation needs a `prefers-reduced-motion` fallback (see bottom of `styles.css`).
- Design system (see `docs/design-brief.md`): paper `#EDEDEA`, ink `#111113`, one accent safelight red `#C8321E`, Satoshi + Pretendard + JetBrains Mono. No em dashes in visible copy.
- Surfaces follow the Liquify CSS policy, all tokens in `:root` of `styles.css`: radius by role only (`--ns-r-surface` 20 / `--ns-r-bar` 25 / `--ns-r-control` 17 / `--ns-r-chip` 12, nested media concentric), one shared edge highlight `--ns-edge` on every panel, card and image, hover pop on `--ns-spring` (controls 1.05, cards 1.03). Don't hardcode radii, shadows or easings.
- Glass (`.lg`, `lg-regular` / `lg-clear` / `lg-prominent`) is only for the functional layer (nav, primary action, field, loupe), never glass on glass. Chromium gets edge refraction via `#ns-lens` (`lens-filter.tsx`, enabled by `html.lg-refract`); other browsers get the frost fallback.
- D1 migrations are additive only (`migrations/000N_*.sql`); they run against live data on deploy.
- Security headers/CSP live in `src/lib/security-headers.server.ts`; add any new external font/image host there.

## Deploy
Push to `main` → `.github/workflows/deploy.yml` (typecheck, build with `VITE_SITE_URL`, D1 migrations, `wrangler deploy`). Hourly `notion-sync.yml` commits Notion changes and calls deploy. Setup steps are in README.md.
