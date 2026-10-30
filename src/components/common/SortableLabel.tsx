'use client';

import { Icon } from '@umami/react-zen';
import { type ReactNode, useEffect, useRef } from 'react';
import { useNavigation } from '@/components/hooks';
import { ChevronDown, ChevronUp } from '@/components/icons';

type SortDirection = 'asc' | 'desc';

export interface SortableLabelProps {
  label: ReactNode;
  sortKey: string;
  defaultDirection?: SortDirection;
}

export function SortableLabel({ label, sortKey, defaultDirection = 'asc' }: SortableLabelProps) {
  const { router, query, updateParams } = useNavigation();
  const isActive = query.orderBy === sortKey;
  const isDescending = query.sortDescending === 'true';
  const direction = isActive ? (isDescending ? 'desc' : 'asc') : undefined;
  const activeColor = 'var(--zen-fg)';

  const getNextDirection = (): SortDirection => {
    if (!isActive) {
      return defaultDirection;
    }

    return direction === 'desc' ? 'asc' : 'desc';
  };

  // The sort is the column header's state (guidelines 1.7): aria-sort goes on the
  // header cell the table renders around this button, not on the button.
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const header = ref.current?.closest('[role="columnheader"], th');
    if (!header) return;
    if (direction)
      header.setAttribute('aria-sort', direction === 'asc' ? 'ascending' : 'descending');
    else header.removeAttribute('aria-sort');
  }, [direction]);

  const handleSort = () => {
    const nextDirection = getNextDirection();

    router.push(
      updateParams({
        orderBy: sortKey,
        sortDescending: nextDirection === 'desc' ? 'true' : undefined,
        page: 1,
      }),
    );
  };

  return (
    <button
      type="button"
      onClick={handleSort}
      ref={ref}
      className="inline-flex appearance-none items-center gap-1 border-0 bg-transparent p-0 text-inherit"
    >
      <span>{label}</span>
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: 0,
          lineHeight: 0,
          color: 'var(--zen-fg-muted)',
          opacity: 0.8,
        }}
      >
        <span
          style={{
            color: direction === 'asc' ? activeColor : undefined,
            opacity: direction === 'asc' ? 1 : 0.55,
            transform: 'scale(0.9)',
            transformOrigin: 'center',
          }}
        >
          <Icon size="sm" color={direction === 'asc' ? undefined : 'muted'}>
            <ChevronUp />
          </Icon>
        </span>
        <span
          style={{
            color: direction === 'desc' ? activeColor : undefined,
            opacity: direction === 'desc' ? 1 : 0.55,
            marginTop: '-6px',
            transform: 'scale(0.9)',
            transformOrigin: 'center',
          }}
        >
          <Icon size="sm" color={direction === 'desc' ? undefined : 'muted'}>
            <ChevronDown />
          </Icon>
        </span>
      </span>
    </button>
  );
}
