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
- [x] `/websites`
- [x] `/websites/[websiteId]` (overview)
- [x] `/websites/[websiteId]/realtime`
- [x] `/websites/[websiteId]/sessions`, `/sessions/[sessionId]` (page and
      modal)
- [x] `/websites/[websiteId]/events`
- [x] `/websites/[websiteId]/compare`
- [x] `/websites/[websiteId]/segments`
- [x] `/websites/[websiteId]/cohorts`
- [x] `/websites/[websiteId]/replays` (`/replays/[replayId]` unchecked: the seed
      has no replays)
- [x] `/websites/[websiteId]/settings`

**Reports** (`/websites/[websiteId]/…`)
- [x] `goals` (with its add and edit dialogs; the seed has no goals: one,
      "Pricing viewed", was added through the dialog)
- [x] `funnels` (with its add, edit and delete dialogs, and a step's event
      filters)
- [x] `journeys` (the diagram's steps are groups, its nodes toggles)
- [x] `retention`
- [x] `breakdown`
- [x] `attribution`
- [x] `utm` (the three empty parameters still read only "No data
      available.": telling them apart would change the page's look)
- [x] `revenue`
- [x] `performance` (the seed has no web vitals: checked with zeros)
- [x] `heatmaps` (the seed has no heatmap data: only its controls checked)

Not yet done for Reports: a task by hand in the chat on each page.

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

- **Bug in agent-om core (blocks /websites/[websiteId]/settings):** a `<form>`
  holding a field named `id` clobbers `form.id`, which then returns that
  `<input>`. Core reads `el.id` (project.ts: `domId`, label lookups, warning
  targets, unresolved references), stores the element in `node.domId`, and
  the projector throws when it serializes the node ("Converting circular
  structure to JSON"): the page's projection stops, stuck at `loading`.
  Proposed fix: read `getAttribute('id')` everywhere core reads an element's
  id, with a test on a form holding `<input name="id">`. Fixed on agent-om's
  `fix/clobbered-element-id` (test fails without it), re-packed here.

- **Finding for agent-om (core), fixed there:** `projectTable` took a
  table's header row only from `<thead>`. An ARIA table (the APG pattern:
  `role="table"`, a `role="rowgroup"` holding a `role="row"` of
  `columnheader`s) got `columns: []` and its header as the first data
  row; an empty one read as one row. Umami's top lists (`ListTable`) are such
  tables. Core now takes the first row as the header when every cell in it is
  a column header. Fixed on agent-om's `fix/aria-header-row-and-view` (test
  fails without it), re-packed here.
- **Finding for agent-om (core and the agent's view), not changed here:**
  loose text equal to the name of an `<img>` beside it is dropped from the
  text (the img node keeps the name), and Claude's outline doesn't show img
  nodes inside text, so the word vanishes from what Claude reads ("Browser
  [img Chrome] Chrome" read as "Browser"). Reproduced on a bare page. Umami's
  icons were made decorative (`alt=""` beside their text, guidelines 1.6),
  which avoids it here.
- **Finding for agent-om (the agent's view), not changed here:** a read-only
  text field (`state.readonly`) is still offered as `type`.
- **Finding for agent-om (the agent's view), fixed there:** a toggle's
  option left out its description (`candidates.ts`: text fields and clicks
  added `describedOf`, toggles didn't), so Claude didn't see the journey
  nodes' counts. Fixed on the same branch, re-packed here.
- **Finding for agent-om (the agent's view), fixed there:** a control with
  `aria-haspopup="dialog"` was offered as "opens its list"; it now says
  "opens a dialog". Fixed on the same branch, re-packed here.

- react-zen's combobox adds a chevron button ("Open") that opens the same
  list as the combobox, and takes no props for it. Umami's `ComboBox` wrapper
  marks it `data-agentom-ignore` after render (guidelines 1.6). The same
  button logs a Base UI `nativeButton` error in the console, upstream.
- react-zen's `FormField` rules don't expose `required`: required fields carry
  `aria-required` themselves (guidelines 1.4). The cohort and segment dialogs
  (done before this) don't yet.
- The lookup hint said "separate up to 5 with commas", which reads as if a
  value could hold several. It's the suggestions' search that splits on commas
  (`getValues`); goals and funnels match their value exactly or with a `*` at
  either end, and now say so.
- Umami bug fixed on the way: the currency select's search compared the
  lower-cased names with the text as typed, so "EUR" found nothing.

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
