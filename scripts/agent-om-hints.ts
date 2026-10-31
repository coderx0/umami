// Generates src/agent-om/sitemap-hints.json, what each page holds (the
// sitemap's `holds`), by crawling the running app with agent-om's crawler
// (../agent-om/eval/apps/harness/hints.ts), then rewrites
// public/semantic-sitemap.json. The crawler follows links from each start and
// keeps, per page template, the names of parts that two of its pages both
// show. Umami's pages need a sign-in, so every page the crawler opens starts
// signed in.
//
// With `pnpm dev` running and agent-om's driver built
// (`pnpm --filter @agent-om/driver build` in ../agent-om):
//   pnpm build:sitemap-hints
// UMAMI_URL (default http://localhost:3000), UMAMI_USER and UMAMI_PASSWORD
// (default admin / umami), AGENT_OM_DIR (default ../agent-om).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Browser, chromium } from '@playwright/test';
import { buildSitemap, HINTS_FILE, sitemapJson } from '../src/agent-om/sitemap';

const root = join(import.meta.dirname, '..');
const agentOm = process.env.AGENT_OM_DIR ?? join(root, '..', 'agent-om');
const origin = process.env.UMAMI_URL ?? 'http://localhost:3000';
// the sidebar's areas; settings and admin are reached from a menu, not a link
const STARTS = ['/websites', '/settings/profile', '/admin/users'];
const LIMIT = 150;

const { crawlHints } = await import(join(agentOm, 'eval', 'apps', 'harness', 'hints.ts'));

const browser = await chromium.launch();
try {
  const login = await browser.newContext();
  const page = await login.newPage();
  await page.goto(`${origin}/login`);
  await page.getByLabel(/username/i).fill(process.env.UMAMI_USER ?? 'admin');
  await page
    .getByLabel(/password/i)
    .first()
    .fill(process.env.UMAMI_PASSWORD ?? 'umami');
  await page.getByRole('button', { name: /^log ?in$/i }).click();
  await page.waitForURL(url => !url.pathname.startsWith('/login'));
  const storageState = await login.storageState();
  await login.close();

  const signedIn = new Proxy(browser, {
    get(target, prop) {
      if (prop === 'newContext') {
        return (options = {}) => target.newContext({ ...options, storageState });
      }
      const value = Reflect.get(target, prop);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as Browser;

  // each start's crawl; a template found by an earlier one keeps its hints
  const hints: Record<string, string[]> = {};
  for (const start of STARTS) {
    const found: Record<string, string[]> = await crawlHints(signedIn, origin, start, LIMIT);
    for (const [template, holds] of Object.entries(found)) hints[template] ??= holds;
  }
  const sorted = Object.fromEntries(Object.entries(hints).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(join(root, HINTS_FILE), `${JSON.stringify(sorted, null, 2)}\n`);
  writeFileSync(join(root, 'public', 'semantic-sitemap.json'), sitemapJson(buildSitemap(root)));
  console.log(
    `\n${HINTS_FILE}:\n${Object.entries(sorted)
      .map(([template, holds]) => `${template} — holds: ${holds.join(', ')}`)
      .join('\n')}`,
  );
} finally {
  await browser.close();
}
