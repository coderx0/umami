import { fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { BoardProvider } from '../BoardProvider';
import { BoardEditBody } from './BoardEditBody';

// one board object, as the query returns the same data until it refetches
const board = vi.hoisted(() => ({
  id: 'board-1',
  type: 'mixed',
  name: 'Campaign assets',
  description: '',
  parameters: { rows: [{ id: 'row-1', columns: [{ id: 'column-1', component: null }] }] },
}));

vi.mock('@/components/hooks/queries/useBoardQuery', () => ({
  useBoardQuery: () => ({ data: board, isFetching: false, isLoading: false }),
}));

// resizable panels need a real layout, which jsdom doesn't have
vi.mock('react-resizable-panels', () => ({
  Group: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Panel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Separator: () => null,
}));

const layoutDescription = () => {
  const layout = screen.getByRole('region', { name: 'Board layout' });
  return document.getElementById(layout.getAttribute('aria-describedby'))?.textContent;
};

test("the board's layout says whether its changes are saved yet", () => {
  render(
    <BoardProvider boardId="board-1" editing>
      <BoardEditBody />
    </BoardProvider>,
  );
  expect(layoutDescription()).toMatch(/^No unsaved changes/);

  fireEvent.click(screen.getByRole('button', { name: 'Add row' }));

  expect(layoutDescription()).toMatch(/^Unsaved changes: .* kept only when the board is saved/);
});
