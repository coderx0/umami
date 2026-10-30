'use client';
import { useIsFetching } from '@tanstack/react-query';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { useDateRange, useWebsiteQuery } from '@/components/hooks';
import { ChatPanel } from './ChatPanel';
import { checkPage } from './check';
import { appContext, screenOf, startProjection } from './projection';

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

  // Navigation and loading don't always touch the DOM, so tell the projector.
  useEffect(() => {
    appContext.screen = screenOf(pathname, params as Record<string, string | string[]>);
    appContext.loading = fetching > 0;
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
