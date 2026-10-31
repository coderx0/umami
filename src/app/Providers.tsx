'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, ZenProvider } from '@umami/react-zen';
import { NextIntlClientProvider } from 'next-intl';
import { Fragment, useEffect } from 'react';
import { AgentOm } from '@/agent-om/AgentOm';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useLocale } from '@/components/hooks';
import 'chartjs-adapter-date-fns';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
});

function MessagesProvider({ children }) {
  const { locale, messages, dir } = useLocale();

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale, dir]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]} onError={() => null}>
      {children}
    </NextIntlClientProvider>
  );
}

// AGENT_OM=off at build time: no projector (next.config.ts)
const AgentOmOrNot = process.env.agentOm === 'off' ? Fragment : AgentOm;

export function Providers({ children }) {
  return (
    <ZenProvider>
      <RouterProvider>
        <MessagesProvider>
          <QueryClientProvider client={client}>
            <AgentOmOrNot>
              <ErrorBoundary>{children}</ErrorBoundary>
            </AgentOmOrNot>
          </QueryClientProvider>
        </MessagesProvider>
      </RouterProvider>
    </ZenProvider>
  );
}
