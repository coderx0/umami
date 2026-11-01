import { Button, Column, Icon, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { type ReactNode, useId } from 'react';
import { useMessages } from '@/components/hooks';
import { Info } from '@/components/icons';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { formatNumber } from '@/lib/format';

export interface MetricCardProps {
  value: number;
  previousValue?: number;
  change?: number;
  label?: string;
  tooltip?: ReactNode;
  reverseColors?: boolean;
  formatValue?: (n: any) => string;
  showLabel?: boolean;
  showChange?: boolean;
}

export const MetricCard = ({
  value = 0,
  change = 0,
  label,
  tooltip,
  reverseColors = false,
  formatValue = formatNumber,
  showLabel = true,
  showChange = false,
}: MetricCardProps) => {
  const diff = value - change;
  const pct = diff !== 0 ? ((value - diff) / diff) * 100 : value !== 0 ? 100 : 0;
  const x = Number(value) || 0;
  const p = Number(pct) || 0;
  // the figures as they are, not counting up to them: a reader takes what's shown (guidelines 1.17)
  const valueText = formatValue(x);
  const pctText = `${Math.abs(~~p)}%`;

  const { t, labels } = useMessages();
  const tooltipId = useId();

  // a group named by its label, so its figure is read as that metric (guidelines 1.12);
  // what the tooltip explains is its description, not only shown on hover
  return (
    <Column
      justifyContent="center"
      paddingX="6"
      paddingY="4"
      borderRadius
      backgroundColor="surface"
      border
      gap="4"
      role="group"
      aria-label={label}
      aria-describedby={tooltip ? tooltipId : undefined}
    >
      {tooltip && (
        <span id={tooltipId} hidden>
          {tooltip}
        </span>
      )}
      {showLabel && (
        <Row justifyContent="space-between" alignItems="flex-start">
          <Text weight="bold" wrap="nowrap">
            {label}
          </Text>
          {tooltip && (
            <TooltipTrigger delay={0}>
              <Button
                size="sm"
                variant="quiet"
                aria-label={t(labels.aboutMetric, { label })}
                aria-describedby={tooltipId}
              >
                <Icon size="sm">
                  <Info />
                </Icon>
              </Button>
              <Tooltip placement="top">{tooltip}</Tooltip>
            </TooltipTrigger>
          )}
        </Row>
      )}
      <Text size="4xl" weight="bold" wrap="nowrap">
        <div title={value?.toString()}>{valueText}</div>
      </Text>
      {showChange && (
        <ChangeLabel value={change} title={formatValue(change)} reverseColors={reverseColors}>
          <div>{pctText}</div>
        </ChangeLabel>
      )}
    </Column>
  );
};
