import { Button, Calendar, Column, Row, ToggleGroup, ToggleGroupItem } from '@umami/react-zen';
import { endOfDay, format, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';

const FILTER_DAY = 'filter-day';
const FILTER_RANGE = 'filter-range';

/**
 * A range calendar's day buttons named with the date they set: the two calendars show the
 * same days, and "Saturday, October 31st, 2026" alone doesn't say which (guidelines 1.3).
 * The day picker's own label, with the calendar's name after it.
 */
const dayLabel =
  (calendar: string) => (date: Date, modifiers: { today?: boolean; selected?: boolean }) =>
    `${modifiers.today ? 'Today, ' : ''}${format(date, 'PPPP')}, ${calendar}${modifiers.selected ? ', selected' : ''}`;

export function DatePickerForm({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  minDate,
  maxDate,
  onChange,
  onClose,
}) {
  const [selected, setSelected] = useState<any>([
    isSameDay(defaultStartDate, defaultEndDate) ? FILTER_DAY : FILTER_RANGE,
  ]);
  const [date, setDate] = useState(defaultStartDate || new Date());
  const [startDate, setStartDate] = useState(defaultStartDate || new Date());
  const [endDate, setEndDate] = useState(defaultEndDate || new Date());
  const { t, labels } = useMessages();
  // clicking a calendar's selected day again clears it; the day stays selected
  const keep = (set: (date: Date) => void) => (value?: Date) => value && set(value);

  const disabled = selected.includes(FILTER_DAY)
    ? isAfter(minDate, date) && isBefore(maxDate, date)
    : isAfter(startDate, endDate);

  const handleSave = () => {
    if (selected.includes(FILTER_DAY)) {
      onChange(`range:${startOfDay(date).getTime()}:${endOfDay(date).getTime()}`);
    } else {
      onChange(`range:${startOfDay(startDate).getTime()}:${endOfDay(endDate).getTime()}`);
    }
  };

  return (
    <Column gap>
      <Row justifyContent="center">
        <ToggleGroup value={selected} onChange={setSelected}>
          <ToggleGroupItem id={FILTER_DAY}>{t(labels.singleDay)}</ToggleGroupItem>
          <ToggleGroupItem id={FILTER_RANGE}>{t(labels.dateRange)}</ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Column>
        {selected.includes(FILTER_DAY) && (
          <Calendar value={date} minValue={minDate} maxValue={maxDate} onChange={keep(setDate)} />
        )}
        {selected.includes(FILTER_RANGE) && (
          // two calendars whose days and months read the same: each is a group named
          // by the date it sets, so a click says which (guidelines 1.3)
          <Row gap wrap="wrap" style={{ margin: '0 auto' }}>
            <div role="group" aria-label={t(labels.startDate)}>
              <Calendar
                value={startDate}
                minValue={minDate}
                maxValue={endDate}
                onChange={keep(setStartDate)}
                labels={{ labelDayButton: dayLabel(t(labels.startDate)) }}
              />
            </div>
            <div role="group" aria-label={t(labels.endDate)}>
              <Calendar
                value={endDate}
                minValue={startDate}
                maxValue={maxDate}
                onChange={keep(setEndDate)}
                labels={{ labelDayButton: dayLabel(t(labels.endDate)) }}
              />
            </div>
          </Row>
        )}
      </Column>
      <Row justifyContent="end" gap>
        <Button onPress={onClose}>{t(labels.cancel)}</Button>
        <Button variant="primary" onPress={handleSave} isDisabled={disabled}>
          {t(labels.apply)}
        </Button>
      </Row>
    </Column>
  );
}
