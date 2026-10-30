import { Column, Grid, Icon, Row, Text } from '@umami/react-zen';
import { differenceInCalendarDays } from 'date-fns';
import type { ReactNode } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useLocale, useMessages, useRetentionQuery } from '@/components/hooks';
import { Users } from '@/components/icons';
import { formatDate } from '@/lib/date';
import { formatLongNumber } from '@/lib/format';

const DAYS = [1, 2, 3, 4, 5, 6, 7, 14, 21, 28];

export interface RetentionProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  days?: number[];
}

export function Retention({ websiteId, days = DAYS, startDate, endDate }: RetentionProps) {
  const { t, labels } = useMessages();
  const { locale } = useLocale();
  const { data, error, isLoading } = useRetentionQuery({
    websiteId,
    startDate,
    endDate,
  });

  const rows =
    data?.reduce((arr: any[], row: { date: any; visitors: any; day: any }) => {
      const { date, visitors, day } = row;
      if (day === 0) {
        return arr.concat({
          date,
          visitors,
          records: days
            .reduce((arr, day) => {
              arr[day] = data.find(
                (x: { date: any; day: number }) => x.date === date && x.day === day,
              );
              return arr;
            }, [])
            .filter(n => n),
        });
      }
      return arr;
    }, []) || [];

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {data && (
        <Panel allowFullscreen height="900px">
          {/* the grid's figures as a table, visually hidden (guidelines 3.4) */}
          <table className="sr-only">
            <caption>{t(labels.retention)}</caption>
            <thead>
              <tr>
                <th scope="col">{t(labels.cohort)}</th>
                <th scope="col">{t(labels.visitors)}</th>
                {days.map(day => (
                  <th key={day} scope="col">
                    {t(labels.day)} {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ date, visitors, records }: any) => {
                const maxDay = differenceInCalendarDays(endDate, new Date(date));
                return (
                  <tr key={date}>
                    <th scope="row">{formatDate(date, 'PP', locale)}</th>
                    <td>{visitors}</td>
                    {days.map(day => {
                      // a day not reached yet is empty; a day with no record had no returns
                      const percentage = records.find(a => a.day === day)?.percentage;
                      return (
                        <td key={day}>
                          {day > maxDay ? '' : `${Number(percentage ?? 0).toFixed(2)}%`}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Column
            data-agentom-ignore=""
            aria-hidden="true"
            paddingY="6"
            paddingX={{ base: '3', md: '6' }}
            position="absolute"
            top="40px"
            left="0"
            right="0"
            bottom="0"
          >
            <Column gap="1" overflow="auto">
              <Grid
                columns="120px repeat(10, 100px)"
                alignItems="center"
                gap="1"
                height="50px"
                width="max-content"
                minWidth="100%"
                autoFlow="column"
              >
                <Column>
                  <Text weight="bold" align="center">
                    {t(labels.cohort)}
                  </Text>
                </Column>
                {days.map(n => (
                  <Column key={n}>
                    <Text weight="bold" align="center" wrap="nowrap">
                      {t(labels.day)} {n}
                    </Text>
                  </Column>
                ))}
              </Grid>
              {rows.map(({ date, visitors, records }: any, rowIndex: number) => {
                const maxDay = differenceInCalendarDays(endDate, new Date(date));
                return (
                  <Grid
                    key={rowIndex}
                    columns="120px repeat(10, 100px)"
                    gap="1"
                    autoFlow="column"
                    width="max-content"
                    minWidth="100%"
                  >
                    <Column justifyContent="center" gap="1">
                      <Text weight="bold">{formatDate(date, 'PP', locale)}</Text>
                      <Row alignItems="center" gap>
                        <Icon>
                          <Users />
                        </Icon>
                        <Text>{formatLongNumber(visitors)}</Text>
                      </Row>
                    </Column>
                    {days.map(day => {
                      if (day > maxDay) return null;
                      const percentage = records.find(a => a.day === day)?.percentage;
                      return (
                        <Cell key={day}>
                          {percentage ? `${Number(percentage).toFixed(2)}%` : ''}
                        </Cell>
                      );
                    })}
                  </Grid>
                );
              })}
            </Column>
          </Column>
        </Panel>
      )}
    </LoadingPanel>
  );
}

const Cell = ({ children }: { children: ReactNode }) => {
  return (
    <Column
      justifyContent="center"
      alignItems="center"
      width="100px"
      height="100px"
      backgroundColor="surface-raised"
      borderRadius
    >
      {children}
    </Column>
  );
};
