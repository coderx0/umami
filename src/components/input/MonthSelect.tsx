import { ListItem, Row, Select } from '@umami/react-zen';
import { useId } from 'react';
import { useLocale, useMessages } from '@/components/hooks';
import { formatDate } from '@/lib/date';

export function MonthSelect({ date = new Date(), onChange }) {
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const monthChoicesId = useId();
  const yearChoicesId = useId();
  const month = date.getMonth();
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();

  const months = [...Array(12)].map((_, i) => i);
  const years = [...Array(10)].map((_, i) => currentYear - i);
  const monthName = (m: number) => formatDate(new Date(year, m, 1), 'MMMM', locale);

  const handleMonthChange = (month: number) => {
    const d = new Date(date);
    d.setMonth(month);
    onChange?.(d);
  };
  const handleYearChange = (year: number) => {
    const d = new Date(date);
    d.setFullYear(year);
    onChange?.(d);
  };

  return (
    <Row gap>
      {/* what each select offers, named before it opens (guidelines 1.16) */}
      <span id={monthChoicesId} hidden>
        {`${t(labels.choices)}: ${months.map(monthName).join(', ')}`}
      </span>
      <span id={yearChoicesId} hidden>
        {`${t(labels.choices)}: ${years.join(', ')}`}
      </span>
      <Select
        value={month}
        onChange={value => handleMonthChange(value as number)}
        buttonProps={{ 'aria-label': t(labels.month), 'aria-describedby': monthChoicesId }}
      >
        {months.map(m => {
          return (
            <ListItem id={m} key={m}>
              {monthName(m)}
            </ListItem>
          );
        })}
      </Select>
      <Select
        value={year}
        onChange={value => handleYearChange(value as number)}
        buttonProps={{ 'aria-label': t(labels.year), 'aria-describedby': yearChoicesId }}
      >
        {years.map(y => {
          return (
            <ListItem id={y} key={y}>
              {y}
            </ListItem>
          );
        })}
      </Select>
    </Row>
  );
}
