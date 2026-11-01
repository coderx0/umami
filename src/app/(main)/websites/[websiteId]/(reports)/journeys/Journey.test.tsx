import type { ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { render, screen } from '@/test/render';
import { Journey } from './Journey';

type Path = { items: string[]; count: number };

let mockData: Path[] = [];

vi.mock('@/components/hooks', () => ({
  useEscapeKey: () => {},
  useJourneyQuery: () => ({ data: mockData, error: null, isLoading: false }),
  useMessages: () => ({
    t: (label: string) => label,
    labels: { visitors: 'visitors', dropoff: 'dropoff', conversion: 'conversion' },
    messages: {},
  }),
}));

vi.mock('@/components/common/LoadingPanel', () => ({
  LoadingPanel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const journey = (startStep?: string) => (
  <Journey
    websiteId="site"
    startDate={new Date('2026-10-01T00:00:00Z')}
    endDate={new Date('2026-10-31T23:59:59Z')}
    steps={3}
    startStep={startStep}
    view="views"
  />
);

const visitors = () => screen.getAllByText(/ visitors$/).map(header => header.textContent);

test('a selected node is cleared when the data changes, so the counts come from the new data', () => {
  mockData = [
    { items: ['/', '/pricing', '/signup'], count: 10 },
    { items: ['/blog', '/pricing', '/docs'], count: 5 },
  ];
  const { rerender } = render(journey());
  fireEvent.click(screen.getByText('/'));
  expect(visitors()).toEqual(['10 visitors', '10 visitors', '10 visitors']);

  mockData = [
    { items: ['/', '/docs', '/pricing'], count: 7 },
    { items: ['/', '/pricing', '/signup'], count: 4 },
  ];
  rerender(journey('/'));

  expect(visitors()).toEqual(['11 visitors', '11 visitors', '11 visitors']);
});
