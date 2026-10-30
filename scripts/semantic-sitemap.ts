// Writes public/semantic-sitemap.json, Umami's semantic sitemap, from the pages
// in src/app (src/agent-om/sitemap.ts). Run it after adding, moving or
// renaming a page: `pnpm build:sitemap`. Rewrites the file only when the map
// changes.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSitemap, sitemapJson } from '../src/agent-om/sitemap';

const root = join(import.meta.dirname, '..');
const file = join(root, 'public', 'semantic-sitemap.json');
const json = sitemapJson(buildSitemap(root));

if (existsSync(file) && readFileSync(file, 'utf8') === json) {
  console.log('semantic-sitemap.json is up to date');
} else {
  writeFileSync(file, json);
  console.log('wrote public/semantic-sitemap.json');
}
