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

- The seed's data ages: "last 24 hours" is empty a day after seeding. On
  2026-10-31 it was moved forward instead of reseeded (a reseed makes the
  demo websites anew, with new ids, and drops their reports): `created_at` of
  `website_event`, `session`, `event_data`, `session_data` and `revenue`
  plus 1 day 01:53, so the latest event was the present. Subtracting the
  same interval undoes it.
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

A task in the chat on each report page (2026-10-30, after the agent-om fixes
for table headers, toggle descriptions and dialog buttons): 12 tasks, all
answered or done right, checked against the pages and the database; $0.022 in
all. Goals, funnels, journeys, retention, breakdown, attribution, UTM and
revenue answered; performance and heatmaps said there's no data (true of the
seed); a goal ("Signup started") and a funnel ("Pricing to signup", 30
minutes) were created through their dialogs. Slips it recovered from: a click
on a control covered by an open list (attribution), and twice an id that
isn't on the page (`combobox:date-range` for `filter.date-range`). After
switching to All time on Performance, Claude saw the website picker read
"Select website" for a moment: not looked into.

**Settings, admin, teams**
- [x] `/settings/profile`, `/settings/preferences`, `/settings/security`,
      `/settings/api-keys` (with their dialogs; 2FA's backup codes not seen:
      turning 2FA on would change every script's sign-in)
- [x] `/settings/websites`, `/settings/websites/[websiteId]`
- [x] `/settings/teams`, `/settings/teams/[teamId]` (a team, "Growth team",
      was created through the dialog; its member rows unchecked: it has one
      member, its owner)
- [x] `/teams`

A task in the chat on Settings and admin pages (2026-10-31): 14 tasks, about
$0.012 with the reruns, checked against the pages and the database. Answered
right: the account's role, its 2FA status, the users and analyst's role, the
websites admin owns. Done right: the timezone set to Europe/Berlin, a team
created and deleted, an API key created and deleted, analyst's role changed to
User (Save asked first: sensitive) and in the team to View only. Asked for the
new API key and for the team's access code, Claude said it can't read them
(redacted) and pointed to the Copy button. Whether 2FA is required for all
users: at first Claude couldn't tell from "turn on switch 'Require 2FA for
all users'"; after the agent-om fix below, it answered (the switch is off). "Reset timezone" ran in a fresh browser, where the zone was already
the browser's, so it showed nothing.

The chat's own prompts couldn't be answered while a page dialog was open: the
app's modal backdrop (and Base UI's guard under it) cover the chat column, and
the app's root, the chat inside it, is marked aria-hidden. Both deletes waited
on "Go ahead?" until they timed out. The question to the user (a risky step,
a secret) is now a native modal dialog put in <body>: the top layer is above
the app's modal, and the app's dialog stays open and usable after it.

Also: the row menus of the admin tables (`MenuButton`) say they open a menu
(`aria-haspopup="menu"` over its dialog trigger) and what's in it; deleting a
user now asks with `ConfirmationForm` (marked destructive) instead of
react-zen's `AlertDialog`; the switches that require 2FA (for everyone, a
team, a user) and saving a user (password and role) are marked sensitive.

Secrets Settings showed to the projection, now kept out (each checked against
the projection with the value on the page):
- the confirm-password field's `autocomplete="confirm-password"` isn't a
  token, so with "Show password" on its value was projected; now
  `new-password`;
- the 2FA setup key, shown as text for manual entry, and the backup codes
  shown after setup: inside `data-agentom-ignore`;
- a new API key, shown once in a read-only field, and the team's access code
  (anyone holding it can join the team): `data-agentom-redact`. The agent
  can't read the access code out to the user; the Copy button still works.
- [x] `/admin/users`, `/admin/users/[userId]` (a view-only user, "analyst",
      was created through the dialog)
- [x] `/admin/websites`, `/admin/websites/[websiteId]`
- [x] `/admin/teams`, `/admin/teams/[teamId]` (analyst was added to Growth
      team as a member through the dialog)
- [x] `/admin/security`

**Boards, links, pixels, console**
- [x] `/boards`, `/boards/create`, `/boards/[boardId]`, `/edit`, `/design`
      (with the board editor, below; a board,
      "Marketing overview", was created through the dialog; `/boards/create`
      only sends you to `/boards`)
- [x] `/links`, `/links/[linkId]`, `/links/[linkId]/edit` (a link, "Pricing
      campaign", and a share link for it, "Public pricing stats", were
      created through the dialogs)
- [x] `/pixels`, `/pixels/[pixelId]`, `/pixels/[pixelId]/edit` (a pixel,
      "Newsletter opens", was created through the dialog)
- [x] `/console/[websiteId]`: skipped. A developer page that fires test
      events, shown only with `ENABLE_TEST_CONSOLE`; without it, it renders
      nothing.

A task in the chat on boards, links and pixels (2026-10-31): 11 tasks, all
answered or done right, checked against the pages and the database; $0.011.
Answered: the links and where one redirects, a pixel's address, what a board
shows from top to bottom. Done: a link created and deleted (confirmed), a
share link added to a link, a pixel renamed, a board created and deleted, a
row with a Metrics bar added to a board and saved, then a row with a Goal
added, moved above it with "Move row up" (rendered now, not only on hover)
and saved. Slips it recovered from: an id that isn't on the page, and a
`select` on a custom select. The figures read 0 because the seed's last event
(2026-10-29 18:28 UTC) is now older than "last 24 hours".

The board editor (`/boards/[boardId]/design`, and `/dashboard/edit`, which
uses the same editor; its two unnamed buttons were the editor's "Select
component" and "Add row"): a row's move up and down, add column and remove
row buttons, and a filled column's edit and remove buttons, are rendered only
while the mouse is over the row or column (`onMouseEnter`). The agent can't
hover (the executor has no hover, on purpose), and a keyboard user can't
reach them either. Decided (2026-10-31): they stay rendered, shown on hover
and on focus within, transparent otherwise; to a mouse user the editor looks
as before. Each row is a group ("Row 1") and each column one named by its
component ("Empty column" before one is chosen), so each button says which
it acts on. agent-om's guidelines now say so (1.5's note on controls revealed
on hover, and a "Pitfalls in real apps" entry).

Also: the component list in "Select component" was clickable rows with no
role, so the agent couldn't choose a component; it's now a listbox, an option
per component by group, the chosen one selected. The shares table
(`SharedSharesTable`, also on the website settings page, which had no shares
when checked) is an ARIA table, so each row's Edit and Delete say which share
they act on.

**Public share pages** (`/share/[slug]/[[...path]]`)
- [x] a website's share ("Public demo", made through the website settings
      dialog), a link's ("Team view") and a board's ("Board view"), each
      checked signed out
  - the share nav's links were `role="button"`: they're links now, in a
    named `<nav>`, the current one `aria-current`
  - the collapse toggle, the theme button, the language button (its
    languages listed; the choices a radio group, the one in use checked)
    and the preferences button are named and described

A task in the chat on each share page, signed out (2026-10-31): 3 tasks, all
answered right, 2 actions each, $0.0035 in all, checked against the pages
and the database. The website share: the top three countries by visitors
in the last 7 days (United States 1.24k, United Kingdom 324, India 279).
The link share: 0 visitors in the last 90 days, no countries; it said the
range ran to Sep 20, which was where the table's rows stopped in the
projection (Notes, the row cap). The board share: the goal (43%, 6.79k of
15.6k) and the metrics bar for the last 30 days, top to bottom.

### 5. Sitemap (done)

Generated from Next's `src/app/` pages by `src/agent-om/sitemap.ts`
(`pnpm build:sitemap` writes `public/semantic-sitemap.json`); checked with
`validateSitemap`. Route groups and parallel routes (`@modal`) are left out,
`[param]` is `{param}` and `[[...path]]` is `*`, a folder without a page folds
into the page above (`admin/users` under `/`), and a page is named by its
metadata title when that says more than its path (`{websiteId}: Overview`).
Declared beside it: the hidden pages (logout, sso, the test console,
`boards/create`, the share pages), one name (a settings team page is titled
"Teams") and where the views are listed (the overview's `?view=`, 26 values
from `WebsiteExpandedMenu`, and compare's, 20 from `CompareTables`).
`src/agent-om/sitemap.test.ts` fails when the file is behind the pages.
Linked from every page (`<link rel="semantic-sitemap">` in the root layout).
The chat loads it from that link at the start of a run and gives Claude the
outline (`siteOutline`), with where the run starts marked.

Measured (2026-10-31): five tasks from `/dashboard`, each once with the map and
once without (the request blocked); $0.024. Retention report, API keys page,
an admin user page: the same 3 steps either way. The overview's full browser
list: neither, as the "More" link that opens it shows only when the table has
data, and the seed's data is now older than the last 24 hours; the map says
the view exists, but nothing navigates by the map. Comparing countries with
the previous period: with the map, right (Compare, last 7 days); without, it
pressed "Previous period" first, which moves the dates back a period, and
compared September with August. That was the button's name, not the map:
"Previous period" (also a choice in Compare's menu) now says it moves the
dates and that comparing is Compare's; rerun without the map, it was right.
No difference the map made shows on pages the sidebar names, as in the
dashboard's measurement (../agent-om/docs/sitemap.md section 6). After the
data was moved forward (below), the browser list: right with the map and
without, the same 3 steps (Websites, Demo SaaS, the panel's "More").

Not done: hints (`holds`, what each page holds), by the crawler in
../agent-om/eval/apps/harness/hints.ts.

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
- **Finding for agent-om (the agent's view), fixed there:** a read-only
  text field (`state.readonly`) was still offered as `type`. It isn't
  offered now; its value is in the outline. Fixed on
  `fix/aria-header-row-and-view` (test fails without it), re-packed here.
- **Finding for agent-om (core's row cap and the agent's read), not changed
  here:** a table holds at most 50 rows in the projection (`totalRows` has
  the full count), and reading one says "(50 on the page)", though the page
  has them all. On the link share's Last 90 days, the traffic table has 91
  days (Aug 2 – Oct 31); Claude read the 50 and said the range ran to
  Sep 20. Its answer (0 visitors) was right.
- **Finding for agent-om (the agent's view), fixed there:** a toggle's
  option left out its description (`candidates.ts`: text fields and clicks
  added `describedOf`, toggles didn't), so Claude didn't see the journey
  nodes' counts. Fixed on the same branch, re-packed here.
- **Finding for agent-om (the agent's view), fixed there:** a switch that
  was off wasn't said to be off: the outline leaves it out and its option read
  "turn on switch …". Asked whether 2FA is required for all users, Claude
  (Haiku) said it couldn't tell. Its option now says "(off)"; asked again, it
  answered that the switch is off. Fixed on `fix/aria-header-row-and-view`,
  re-packed here.
- **Finding for agent-om (the agent's view), fixed there:** a control with
  `aria-haspopup="dialog"` was offered as "opens its list"; it now says
  "opens a dialog". Fixed on the same branch, re-packed here.

- react-zen's combobox adds a chevron button ("Open") that opens the same
  list as the combobox, and takes no props for it. Umami's `ComboBox` wrapper
  marks it `data-agentom-ignore` after render (guidelines 1.6). The same
  button logs a Base UI `nativeButton` error in the console, upstream.
- react-zen's `FormField` rules don't expose `required`: required fields carry
  `aria-required` themselves (guidelines 1.4). The cohort and segment dialogs
  (done before this) now do too (their name, and the cohort's action value),
  and their forms are named, as the goal's is.
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
- Manual task (2026-10-31): a goal, then last month's signup_completed
  conversions by country, a segment, a board and a share, stopped at the
  30-action limit. 13 actions went on the custom date range: its two
  calendars (start and end) both show the same month, and their days read
  the same, so "September 30th" set the start date again and the range came
  out Sep 30 – Oct 31. The calendars are now groups named "Start date" and
  "End date", and agent-om's view tells twins apart by the nearest container
  where they differ (it named only the nearest, both "October 2026"). And
  the Filter button listed Event among its fields on pages whose form leaves
  it out (only Events, Replays and Heatmaps filter by event): its
  description and the form now take the fields from one function, and say
  that filtering by event is on the Events page.
- Manual task B (2026-10-31, at 3x the limits): done in 48 actions, $0.025,
  right, and it said the second page (/signup) made a funnel to itself. One
  wasted click: it followed the Funnels link and read the page before Next
  had shown it (the route was still compiling), and the page said `ready`.
  A followed link now counts as loading until the address changes
  (AgentOm.tsx; at most 10 s), as the guidelines' "Loading and settling"
  asks: measured, `loading` for the 330 ms it took, then `ready` on the new
  page.
- A run that ends with a page dialog open (an expanded table on the
  overview) leaves the chat column covered by the dialog's backdrop: Run and
  Clear can't be pressed until the dialog closes (Escape). The chat's
  questions are in the top layer and aren't affected.
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
