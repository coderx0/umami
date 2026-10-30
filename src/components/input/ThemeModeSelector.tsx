import { Button, Icon, Row } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { useMessages } from '@/components/hooks';
import { Monitor, Moon, Sun } from '@/components/icons';

export type ThemeMode = 'light' | 'dark' | 'system';

export function ThemeModeSelector({
  value,
  onChange,
  includeSystem = false,
}: {
  value?: ThemeMode;
  onChange: (value: ThemeMode) => void;
  includeSystem?: boolean;
}) {
  const { t, labels } = useMessages();
  const options: { id: ThemeMode; icon: ReactNode; label: string }[] = [
    { id: 'light', icon: <Sun />, label: 'Light' },
    ...(includeSystem ? [{ id: 'system' as const, icon: <Monitor />, label: 'System' }] : []),
    { id: 'dark', icon: <Moon />, label: 'Dark' },
  ];

  return (
    // one choice of theme: a radio group whose chosen theme is checked (guidelines 1.4)
    <Row gap role="radiogroup" aria-label={t(labels.theme)}>
      {options.map(({ id, icon, label }) => (
        <Button
          key={id}
          variant={value === id ? 'primary' : undefined}
          onPress={() => onChange(id)}
          aria-label={label}
          role="radio"
          aria-checked={value === id}
        >
          <Icon>{icon}</Icon>
        </Button>
      ))}
    </Row>
  );
}
