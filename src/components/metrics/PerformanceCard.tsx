import { Column, Text } from '@umami/react-zen';
import { useSpring, useTransform } from 'motion/react';
import { useEffect, useId, useRef } from 'react';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { Badge } from '@/components/common/Badge';
import { useMessages } from '@/components/hooks';
import { WEB_VITALS_THRESHOLDS } from '@/lib/constants';
import { formatNumber } from '@/lib/format';
import styles from './PerformanceCard.module.css';

export interface PerformanceCardProps {
  metric: 'lcp' | 'inp' | 'cls' | 'fcp' | 'ttfb';
  value: number;
  label: string;
  formatValue?: (n: any) => string;
  onClick?: () => void;
  selected?: boolean;
}

const RATING_VARIANTS = {
  good: 'good',
  'needs-improvement': 'warning',
  poor: 'danger',
} as const;

function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = WEB_VITALS_THRESHOLDS[metric as keyof typeof WEB_VITALS_THRESHOLDS];
  if (!threshold || value <= 0) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export const PerformanceCard = ({
  metric,
  value = 0,
  label,
  formatValue = formatNumber,
  onClick,
  selected = false,
}: PerformanceCardProps) => {
  const { t, labels } = useMessages();
  const valueId = useId();
  const ratingId = useId();
  const rating = getRating(metric, value);
  const prevMetricRef = useRef(metric);
  const metricChanged = prevMetricRef.current !== metric;
  if (metricChanged) prevMetricRef.current = metric;

  const target = !Number.isNaN(value) ? value : 0;
  const spring = useSpring(target, { stiffness: 170, damping: 26 });
  const display = useTransform(spring, n => formatValue(n));

  useEffect(() => {
    if (metricChanged) spring.jump(target);
    else spring.set(target);
  }, [target, metricChanged, spring]);

  // with onClick, a choice of metric: a radio named by it, described by its value and
  // rating (guidelines 1.4)
  const choice = onClick
    ? {
        role: 'radio',
        'aria-checked': selected,
        'aria-label': label,
        'aria-describedby': `${valueId} ${ratingId}`,
        'data-agentom-id': `performance.metric.${metric}`,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <Column
      {...choice}
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      justifyContent="center"
      paddingX="6"
      paddingY="4"
      borderRadius
      backgroundColor="surface"
      border
      gap="4"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      <Text weight="bold" wrap="nowrap">
        {label}
      </Text>
      <Text size="4xl" weight="bold" wrap="nowrap" id={valueId}>
        <AnimatedDiv>{display}</AnimatedDiv>
      </Text>
      <Badge variant={RATING_VARIANTS[rating]} id={ratingId}>
        {t(labels[rating === 'needs-improvement' ? 'needsImprovement' : rating])}
      </Badge>
    </Column>
  );
};
