import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { locate, validateSitemap } from '@agent-om/core/sitemap';
import { expect, test } from 'vitest';
import { buildSitemap, findPages, sitemapJson } from './sitemap';

const root = process.cwd();
const map = buildSitemap(root);

test('public/semantic-sitemap.json is up to date with the pages (pnpm build:sitemap)', () => {
  expect(readFileSync(join(root, 'public', 'semantic-sitemap.json'), 'utf8')).toBe(
    sitemapJson(map),
  );
});

test('is a valid map', () => {
  expect(validateSitemap(map)).toEqual([]);
});

test('reads paths as Next serves them: no route groups or parallel routes, params as templates', () => {
  const paths = findPages(root).map(page => page.path);
  expect(paths).toContain('/websites/{websiteId}/goals'); // from (main)/…/(reports)/goals
  expect(paths).toContain('/share/{slug}/*'); // [[...path]]
  expect(paths.some(path => path.includes('(') || path.includes('@'))).toBe(false);
});

test('places each page under the nearest page above it, and leaves out what is hidden', () => {
  expect(locate(map, '/websites/abc/goals')?.node.path).toBe('goals');
  expect(locate(map, '/admin/users/abc')?.node.name).toBe('User');
  expect(locate(map, '/settings/teams/abc')?.node.name).toBe('Team');
  for (const path of ['/logout', '/sso', '/console/abc', '/share/abc']) {
    expect(locate(map, path)?.node.path ?? '/').toBe('/');
  }
  // only redirects to /boards; its address reads as a board's ({boardId})
  const boards = map.children?.find(node => node.path === 'boards');
  expect(boards?.children?.map(node => node.path)).toEqual(['{boardId}']);
});

test("names a page by its title when the title says more than its path, and reads a page's views", () => {
  expect(locate(map, '/websites/abc')?.node.name).toBe('Overview');
  expect(locate(map, '/websites/abc/realtime')?.node.name).toBeUndefined(); // "Real-time"
  expect(locate(map, '/websites/abc')?.node.views?.view).toContain('browser');
  expect(locate(map, '/websites/abc/compare')?.node.views?.view).toContain('channel');
});
