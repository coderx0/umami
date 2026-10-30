import { Column, Grid, Row, Text } from '@umami/react-zen';
import { useSpring, useTransform } from 'motion/react';
import { type ReactNode, useEffect } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { Empty } from '@/components/common/Empty';
import { useMessages, useMobile } from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';

const ITEM_SIZE = 30;

interface ListData {
  label: string;
  count: number;
  percent: number;
}

export interface ListTableProps {
  data?: ListData[];
  title?: string;
  /** the table's name, when its title alone doesn't say which table it is */
  label?: string;
  metric?: string;
  className?: string;
  renderLabel?: (data: ListData, index: number) => ReactNode;
  renderChange?: (data: ListData, index: number) => ReactNode;
  animate?: boolean;
  virtualize?: boolean;
  showPercentage?: boolean;
  itemCount?: number;
  formatCount?: (n: number) => string;
}

export function ListTable({
  data = [],
  title,
  label,
  metric,
  renderLabel,
  renderChange,
  animate = true,
  virtualize = false,
  showPercentage = true,
  itemCount = 10,
  formatCount,
}: ListTableProps) {
  const { t, labels } = useMessages();
  const { isPhone } = useMobile();

  const getRow = (row: ListData, index: number) => {
    const { label, count, percent } = row;

    return (
      <AnimatedRow
        key={`${label}${index}`}
        label={renderLabel ? renderLabel(row, index) : (label ?? t(labels.unknown))}
        value={count}
        percent={percent}
        animate={animate && !virtualize}
        showPercentage={showPercentage}
        rowIndex={virtualize ? index + 2 : undefined}
        change={renderChange ? renderChange(row, index) : null}
        formatCount={formatCount}
        isPhone={isPhone}
      />
    );
  };

  const ListTableRow = ({ index, style }: RowComponentProps) => {
    return <div style={style}>{getRow(data[index], index)}</div>;
  };

  // A table to whatever reads it (guidelines 1.2, 1.7): the rows are named by their label,
  // the columns are the title, the metric and the share.
  return (
    <Column
      gap
      role="table"
      aria-label={label ?? title}
      aria-rowcount={virtualize ? data.length + 1 : undefined}
    >
      <div role="rowgroup">
        <Grid
          alignItems="center"
          justifyContent="space-between"
          paddingLeft="2"
          columns={'1fr 100px'}
          role="row"
          aria-rowindex={virtualize ? 1 : undefined}
        >
          <Text weight="bold" role="columnheader">
            {title}
          </Text>
          <Text weight="bold" align="center" role="columnheader">
            {metric}
          </Text>
          {showPercentage && (
            <span role="columnheader" className="sr-only">
              {t(labels.shareOfTotal)}
            </span>
          )}
        </Grid>
      </div>
      <Column gap="1" role="rowgroup">
        {data?.length === 0 && <Empty />}
        {virtualize && data.length > 0 ? (
          <List
            style={{ width: '100%', height: itemCount * ITEM_SIZE }}
            defaultHeight={itemCount * ITEM_SIZE}
            rowCount={data.length}
            rowHeight={ITEM_SIZE}
            rowComponent={ListTableRow}
            rowProps={{}}
          />
        ) : (
          data.map(getRow)
        )}
      </Column>
    </Column>
  );
}

const AnimatedRow = ({
  label,
  value = 0,
  percent,
  change,
  animate,
  showPercentage = true,
  formatCount,
  isPhone,
  rowIndex = undefined,
}) => {
  const y = !Number.isNaN(value) ? value : 0;
  const ySpring = useSpring(0, { stiffness: 170, damping: 26 });
  const widthSpring = useSpring(0, { stiffness: 170, damping: 26 });
  const yText = useTransform(ySpring, n => (formatCount ? formatCount(n) : formatLongNumber(n)));
  const widthText = useTransform(widthSpring, n => `${n?.toFixed?.(0)}%`);

  useEffect(() => {
    if (animate) {
      ySpring.set(y);
      widthSpring.set(percent);
    } else {
      ySpring.jump(y);
      widthSpring.jump(percent);
    }
  }, [y, percent, animate, ySpring, widthSpring]);

  return (
    <Grid
      columns={showPercentage ? '1fr 50px 50px' : '1fr 100px'}
      paddingLeft="2"
      alignItems="center"
      borderRadius
      gap
      hover={{ backgroundColor: 'surface-sunken' }}
      role="row"
      aria-rowindex={rowIndex}
    >
      <Row alignItems="center" role="rowheader">
        <Text truncate={true} style={{ maxWidth: isPhone ? '200px' : '400px' }}>
          {label}
        </Text>
      </Row>
      <Row
        alignItems="center"
        height="30px"
        justifyContent={showPercentage ? 'flex-end' : 'center'}
        role="cell"
      >
        {change}
        <Text weight="bold">
          <AnimatedDiv title={String(value)}>{yText}</AnimatedDiv>
        </Text>
      </Row>
      {showPercentage && (
        <Row
          alignItems="center"
          justifyContent="flex-start"
          position="relative"
          border="left"
          borderColor="strong"
          color="muted"
          paddingLeft="3"
          role="cell"
        >
          <AnimatedDiv>{widthText}</AnimatedDiv>
        </Row>
      )}
    </Grid>
  );
};
