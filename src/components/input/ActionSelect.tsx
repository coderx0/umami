import { ListItem, Select } from '@umami/react-zen';
import { useId } from 'react';
import { useMessages } from '@/components/hooks';

export interface ActionSelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function ActionSelect({ value = 'path', onChange }: ActionSelectProps) {
  const { t, labels } = useMessages();
  const choicesId = useId();

  return (
    <>
      <span id={choicesId} hidden>
        {`${t(labels.choices)}: ${t(labels.viewedPage)}, ${t(labels.triggeredEvent)}`}
      </span>
      <Select
        value={value}
        onChange={val => onChange?.(val as string)}
        buttonProps={{ 'aria-label': t(labels.action), 'aria-describedby': choicesId }}
      >
        <ListItem id="path">{t(labels.viewedPage)}</ListItem>
        <ListItem id="event">{t(labels.triggeredEvent)}</ListItem>
      </Select>
    </>
  );
}
