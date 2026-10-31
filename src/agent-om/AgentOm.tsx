'use client';
import { useIsFetching } from '@tanstack/react-query';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { useDateRange, useWebsiteQuery } from '@/components/hooks';
import { ChatPanel } from './ChatPanel';
import { checkPage } from './check';
import { appContext, NAVIGATION_TIMEOUT, screenOf, startProjection } from './projection';

/**
 * Runs the app's projector and keeps its context current: the screen from the
 * route, whether data is loading, and on a website's pages the website and the
 * dates its reports cover. Rendered once, around the app, inside
 * the query client. In dev mode the screen is split: the app in its column,
 * the chat in its own beside it, so the chat never covers any of the app.
 */
export function AgentOm({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const search = useSearchParams();
  const fetching = useIsFetching();
  const websiteId = typeof params.websiteId === 'string' ? params.websiteId : undefined;
  const { data: website } = useWebsiteQuery(websiteId);
  const { dateRange } = useDateRange();

  useEffect(() => {
    startProjection();
    if (process.env.NODE_ENV !== 'production') window.__agentOmCheck = checkPage;
  }, []);

  // Next follows a link in the background: until the address changes, the old
  // page is still shown, so a followed link counts as loading (guidelines,
  // "Loading and settling": a navigation pending). Cleared below when the
  // address changes, or after NAVIGATION_TIMEOUT if it never does.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) {
        return;
      }
      const url = new URL(link.href, window.location.href);
      const from = window.location.pathname + window.location.search;
      if (url.origin !== window.location.origin || url.pathname + url.search === from) return;
      appContext.navigation = { from, since: Date.now() };
      window.__semanticUI?.refresh();
      setTimeout(() => window.__semanticUI?.refresh(), NAVIGATION_TIMEOUT);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Navigation and loading don't always touch the DOM, so tell the projector.
  useEffect(() => {
    appContext.screen = screenOf(pathname, params as Record<string, string | string[]>);
    appContext.loading = fetching > 0;
    const here = pathname + (search.size ? `?${search.toString()}` : '');
    if (appContext.navigation && appContext.navigation.from !== here) {
      appContext.navigation = undefined;
    }
    appContext.website = websiteId
      ? { id: websiteId, ...(website?.name ? { name: website.name } : {}) }
      : undefined;
    appContext.dateRange = websiteId
      ? {
          start: dateRange.startDate.toISOString(),
          end: dateRange.endDate.toISOString(),
          unit: dateRange.unit,
        }
      : undefined;
    window.__semanticUI?.refresh();
  }, [pathname, params, search, fetching, websiteId, website?.name, dateRange]);

  if (process.env.NODE_ENV === 'production') return children;
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        style={{ flex: 1, minWidth: 0, height: '100vh', overflow: 'auto', position: 'relative' }}
      >
        {children}
      </div>
      <ChatPanel />
    </div>
  );
}
