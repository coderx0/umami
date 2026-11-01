import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import { DatePickerForm } from './DatePickerForm';

// A calendar whose selected day can be clicked again: the day picker then
// reports no date, as react-day-picker does in single mode.
vi.mock('@umami/react-zen', () => ({
  Button: ({
    children,
    onPress,
    isDisabled,
  }: {
    children: ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
  }) => (
    <button type="button" onClick={onPress} disabled={isDisabled}>
      {children}
    </button>
  ),
  Calendar: ({ value, onChange }: { value: Date; onChange: (date?: Date) => void }) => (
    <button type="button" onClick={() => onChange(undefined)}>
      {`selected ${value?.toISOString?.() ?? 'none'}`}
    </button>
  ),
  Column: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Row: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ToggleGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ToggleGroupItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (label: string) => label,
    labels: { apply: 'Apply', cancel: 'Cancel' },
  }),
}));

test('clicking a selected day again keeps it, so Apply never gives a range without a date', () => {
  const onChange = vi.fn();
  const start = new Date('2026-10-01T00:00:00');
  const end = new Date('2026-10-31T00:00:00');
  render(
    <DatePickerForm
      startDate={start}
      endDate={end}
      minDate={new Date('2026-01-01T00:00:00')}
      maxDate={new Date('2026-12-31T00:00:00')}
      onChange={onChange}
      onClose={() => {}}
    />,
  );

  const [startCalendar, endCalendar] = screen.getAllByText(/^selected /);
  fireEvent.click(endCalendar);
  fireEvent.click(startCalendar);
  fireEvent.click(screen.getByText('Apply'));

  expect(onChange).toHaveBeenCalledTimes(1);
  const [, from, to] = onChange.mock.calls[0][0].split(':').map(Number);
  expect(Number.isNaN(from) || Number.isNaN(to)).toBe(false);
  expect(new Date(from).getDate()).toBe(1);
  expect(new Date(to).getDate()).toBe(31);
});
