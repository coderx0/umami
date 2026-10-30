import { type ComboBoxProps, type ListProps, ComboBox as ZenComboBox } from '@umami/react-zen';
import { useLayoutEffect, useRef } from 'react';

const defaultListProps: Partial<ListProps> = {
  style: {
    maxHeight: 'min(400px, calc(100dvh - 8rem))',
  },
};

export function ComboBox({ listProps, ...props }: ComboBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mergedListProps: ListProps = {
    ...defaultListProps,
    ...listProps,
    style: {
      ...defaultListProps.style,
      ...listProps?.style,
    },
  };

  // The chevron opens the same list as the combobox itself, so it's left out of
  // the projection (guidelines 1.6). react-zen takes no props for it, and its
  // input group button replaces the trigger's own data-slot.
  useLayoutEffect(() => {
    ref.current
      ?.querySelector('[data-slot="input-group-button"][aria-haspopup="listbox"]')
      ?.setAttribute('data-agentom-ignore', '');
  });

  return (
    <div ref={ref} style={{ display: 'contents' }}>
      <ZenComboBox {...props} listProps={mergedListProps} />
    </div>
  );
}

export type { ComboBoxProps };
