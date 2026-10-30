import { Button, ListItem, Row, Select } from '@umami/react-zen';
import { useId, useState } from 'react';
import { useMessages, useTimezone } from '@/components/hooks';
import { getTimezone } from '@/lib/date';

const timezones = Intl.supportedValuesOf('timeZone');

export function TimezoneSetting() {
  const [search, setSearch] = useState('');
  const { t, labels, messages } = useMessages();
  const hintId = useId();
  const { timezone, saveTimezone } = useTimezone();
  const items = search
    ? timezones.filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : timezones;

  const handleReset = () => saveTimezone(getTimezone());

  const handleOpen = isOpen => {
    if (isOpen) {
      setSearch('');
    }
  };

  return (
    <Row gap>
      {/* what the select offers: too many time zones to list (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.timezoneSearchRule)}
      </span>
      <Select
        value={timezone}
        onChange={(value: any) => saveTimezone(value)}
        allowSearch={true}
        onSearch={setSearch}
        onOpenChange={handleOpen}
        maxHeight={480}
        buttonProps={{
          style: { minWidth: '250px' },
          'aria-label': t(labels.timezone),
          'aria-describedby': hintId,
        }}
      >
        {items.map((item: any) => (
          <ListItem key={item} id={item}>
            {item}
          </ListItem>
        ))}
        {!items.length && <ListItem></ListItem>}
      </Select>
      <Button
        onPress={handleReset}
        aria-label={t(labels.resetSetting, { setting: t(labels.timezone) })}
      >
        {t(labels.reset)}
      </Button>
    </Row>
  );
}
