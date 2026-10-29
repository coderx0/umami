# Plan: the Agent Object Model in Umami

Branch `feat/add-agent-om` in the fork (coderx0/umami, from upstream v3.4.1,
`559e3c607`). Agreed 2026-10-29.

## Goal

Make Umami follow the Agent Object Model guidelines
(`../agent-om/docs/guidelines.md`), page by page, and add a chat panel that
runs Claude Haiku on the projection, so it can be tested by hand on a real app
we didn't build.

## Decisions

1. **Packages from packed tarballs.** `core` and `react` are built and packed
   in `../agent-om` (`pnpm build`, `pnpm pack`) and installed as `file:`
   dependencies, as an npm user would get them. `agent` and `actions` are
   packed the same way; they have no build and ship TypeScript source, so
   Next compiles them (`transpilePackages` in `next.config.ts`).
2. **The chat lives in Umami**, as a dev-only React component: Claude Haiku
   only (`runClaude` from `@agent-om/agent/claude`), no decision model. A
   chat package is left until the chat has run here and a second app wants it.
   The driver isn't used: it runs the agent from Node on a Playwright page,
   while this chat runs it in the page.
3. **Area by area, page by page**, each page checked before the next.

Nothing from Umami goes into agent-om (the agent-om side only builds the
tarballs). Nothing goes into agent-om-exp.

## Setup (done)

- Postgres 15 in Docker: container `umami-db`, port 5432, volume
  `umami-db-data`. Umami's `.env` holds `DATABASE_URL`, `APP_SECRET` and
  `TWO_FACTOR_ENCRYPTION_KEY` (git-ignored).
- Migrations applied; default login `admin` / `umami`.
- Seeded with Umami's own script, 90 days (`pnpm db:seed --days 90`): Demo
  Blog (274 sessions) and Demo SaaS (46,280 sessions, 133,247 events, 4,019
  revenue entries).
- `pnpm dev` serves http://localhost:3000.

## Steps

### 1. Packages in (done)

- Pack `core`, `react`, `actions` and `agent` from `../agent-om` into
  `vendor/agent-om/` (git-ignored), with a small script to re-pack after
  changes there.
- Add them as `file:` dependencies; `transpilePackages` for `agent` and
  `actions`.

### 2. Projector and context (done)

- Start one projector on the client (Umami's `Providers.tsx` or the main
  layout), on `window.__semanticUI`.
- Context: `screen` from the route, `path` and `query` from Next's router;
  refresh on navigation (guidelines 5.1–5.3).
- `onWarning` logs every warning to the console in dev.

### 3. Chat panel (done)

- Dev-only, in a column of its own beside the app's (the app's column
  narrows), never over the page: an overlay covered the page's popups, and
  the executor rightly refused clicks it covered. A query box, the run's
  steps, the answer, Stop; collapsed, a strip.
- Risky steps ask for confirmation; a secret field asks the user for its
  value, which never goes to the model.
- The Anthropic key from Umami's `.env`, reaching the browser in dev mode
  only.
- A "what Claude sees" view: the text view of the current page and the
  projector's warnings, for patching and for manual tests.

### 4. Pages, area by area

Each page is done when: no projector warnings; the guidelines' automatic
checks are clean (unnamed actionable elements, search fields without a
description, popups without their choices, modal reported, screen set); the
text view reads right; and a task on it works by hand in the chat.

**Shell**
- [x] `/login`, `/login/two-factor`, `/logout`, `/sso`
- [x] Navigation (`SideNav`, `TopNav`, `MobileNav`), website picker, page
      titles
- [x] `/dashboard`, `/dashboard/edit` (the editor's unnamed add button is the
      board editor's: done with boards)

**Websites**
- [ ] `/websites`
- [ ] `/websites/[websiteId]` (overview)
- [ ] `/websites/[websiteId]/realtime`
- [ ] `/websites/[websiteId]/sessions`, `/sessions/[sessionId]` (page and
      modal)
- [ ] `/websites/[websiteId]/events`
- [ ] `/websites/[websiteId]/compare`
- [ ] `/websites/[websiteId]/segments`
- [ ] `/websites/[websiteId]/cohorts`
- [ ] `/websites/[websiteId]/replays`, `/replays/[replayId]` (page and modal)
- [ ] `/websites/[websiteId]/settings`

**Reports** (`/websites/[websiteId]/…`)
- [ ] `goals`
- [ ] `funnels`
- [ ] `journeys`
- [ ] `retention`
- [ ] `breakdown`
- [ ] `attribution`
- [ ] `utm`
- [ ] `revenue`
- [ ] `performance`
- [ ] `heatmaps`

**Settings, admin, teams**
- [ ] `/settings/profile`, `/settings/preferences`, `/settings/security`,
      `/settings/api-keys`
- [ ] `/settings/websites`, `/settings/websites/[websiteId]`
- [ ] `/settings/teams`, `/settings/teams/[teamId]`
- [ ] `/teams`
- [ ] `/admin/users`, `/admin/users/[userId]`
- [ ] `/admin/websites`, `/admin/websites/[websiteId]`
- [ ] `/admin/teams`, `/admin/teams/[teamId]`
- [ ] `/admin/security`

**Boards, links, pixels, console**
- [ ] `/boards`, `/boards/create`, `/boards/[boardId]`, `/edit`, `/design`
- [ ] `/links`, `/links/[linkId]`, `/links/[linkId]/edit`
- [ ] `/pixels`, `/pixels/[pixelId]`, `/pixels/[pixelId]/edit`
- [ ] `/console/[websiteId]`

Public pages (`/share/[slug]`) come after the signed-in app, if wanted.

### 5. Sitemap

Generated from Next's `src/app/` routes (route groups dropped, dynamic
segments as path templates), per `../agent-om/docs/sitemap.md`; checked with
`validateSitemap`.

## Notes

- Umami's TypeScript settings (`strictNullChecks: false`) report errors
  inside the `agent` package's source (narrowing on `ok: true | false`
  unions). They don't affect runtime, and Next ignores type errors here
  (`ignoreBuildErrors`); the packages are left unchanged. A host that
  typechecks with looser settings than agent-om's meets this whenever a
  package ships its source.
- Next's dev indicator sits bottom right, over the chat's column; the
  composer leaves room for it.
- Don't `git stash` (or otherwise swap package.json) here to compare with
  upstream: `pnpm exec` checks dependencies before running and prunes
  `@agent-om/*` when package.json doesn't list them. `pnpm install` brings
  them back.
- Format only the files changed (`biome check --write <files>`): upstream
  isn't fully formatted, and a folder-wide run reformats files we never
  touched.
- Transcripts: each run is saved to `transcripts/` (git-ignored) by
  `api/agent-om/transcripts`, after every request and at the end.

- `AGENTS.md` at the root was written by Next on first start; it isn't part
  of this work.
- No commits are made by Claude; the user commits.
