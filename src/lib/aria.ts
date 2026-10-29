/**
 * `aria-current` for a navigation link: "page" on the page it links to, "true"
 * while inside the section it leads to (a sub-page, a record of it), nothing
 * otherwise. The query is ignored: a link with the current filters still
 * names the same page.
 */
export function ariaCurrent(pathname: string, href: string, inSection: boolean) {
  if (pathname === href.split('?')[0]) return 'page' as const;
  return inSection ? ('true' as const) : undefined;
}
