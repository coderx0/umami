import { Button, Icon, ListItem, Row, Select, Text } from '@umami/react-zen';
import { isAfter } from 'date-fns';
import { useId, useMemo } from 'react';
import { useDateRange, useDateRangeQuery, useMessages, useNavigation } from '@/components/hooks';
import { ChevronRight } from '@/components/icons';
import { getDateRangeValue } from '@/lib/date';
import { DateFilter } from './DateFilter';

export interface WebsiteDateFilterProps {
  websiteId?: string;
  compare?: string;
  showAllTime?: boolean;
  showButtons?: boolean;
  allowCompare?: boolean;
}

export function WebsiteDateFilter({
  websiteId,
  showAllTime = true,
  showButtons = true,
  allowCompare,
}: WebsiteDateFilterProps) {
  const { dateRange, isAllTime, isCustomRange } = useDateRange();
  const { t, labels, messages } = useMessages();
  const previousHintId = useId();
  const nextHintId = useId();
  const compareChoicesId = useId();
  const {
    router,
    updateParams,
    query: { compare = 'prev', offset = 0 },
  } = useNavigation();
  const disableForward = isAllTime || isAfter(dateRange.endDate, new Date());
  const showCompare = allowCompare && !isAllTime;

  const websiteDateRange = useDateRangeQuery(websiteId);
  const { startDate, endDate } = websiteDateRange;
  const hasData = startDate && endDate;

  const handleChange = (date: string) => {
    if (date === 'all' && hasData) {
      router.push(
        updateParams({
          date: `${getDateRangeValue(websiteDateRange.startDate, websiteDateRange.endDate)}:all`,
          offset: undefined,
          page: 1,
        }),
      );
    } else {
      router.push(updateParams({ date, offset: undefined, unit: undefined, page: 1 }));
    }
  };

  const handleIncrement = increment => {
    router.push(updateParams({ offset: Number(offset) + increment }));
  };
  const handleSelect = (compare: any) => {
    router.push(updateParams({ compare }));
  };

  const dateValue = useMemo(() => {
    return offset !== 0
      ? getDateRangeValue(dateRange.startDate, dateRange.endDate)
      : dateRange.value;
  }, [dateRange]);

  return (
    <Row wrap="wrap" gap>
      {showButtons && !isAllTime && !isCustomRange && (
        <Row gap="1">
          {/* what they do: "Previous period" moves the dates, it doesn't compare (guidelines 3.3) */}
          <span id={previousHintId} hidden>
            {t(messages.previousPeriodHint)}
          </span>
          <span id={nextHintId} hidden>
            {t(messages.nextPeriodHint)}
          </span>
          <Button
            onPress={() => handleIncrement(-1)}
            variant="outline"
            aria-label={t(labels.previousPeriod)}
            aria-describedby={previousHintId}
            data-agentom-id="filter.previous-period"
          >
            <Icon rotate={180}>
              <ChevronRight />
            </Icon>
          </Button>
          <Button
            onPress={() => handleIncrement(1)}
            variant="outline"
            isDisabled={disableForward}
            aria-label={t(labels.nextPeriod)}
            aria-describedby={nextHintId}
            data-agentom-id="filter.next-period"
          >
            <Icon>
              <ChevronRight />
            </Icon>
          </Button>
        </Row>
      )}
      <DateFilter
        className="min-w-[200px]"
        buttonProps={{ ...({ 'data-agentom-id': 'filter.date-range' } as Record<string, string>) }}
        value={dateValue}
        onChange={handleChange}
        showAllTime={hasData && showAllTime}
        renderDate={+offset !== 0}
      />
      {showCompare && (
        <Row alignItems="center" gap>
          <Text weight="bold">VS</Text>
          <span id={compareChoicesId} hidden>
            {`${t(labels.choices)}: ${t(labels.previousPeriod)}, ${t(labels.previousYear)}`}
          </span>
          <Row width="200px">
            <Select
              value={compare}
              onChange={handleSelect}
              buttonProps={{
                style: { width: 200 },
                'aria-label': t(labels.compareTo),
                'aria-describedby': compareChoicesId,
                ...({ 'data-agentom-id': 'filter.compare' } as Record<string, string>),
              }}
              popoverProps={{ style: { width: 200 } }}
            >
              <ListItem id="prev">{t(labels.previousPeriod)}</ListItem>
              <ListItem id="yoy">{t(labels.previousYear)}</ListItem>
            </Select>
          </Row>
        </Row>
      )}
    </Row>
  );
}
