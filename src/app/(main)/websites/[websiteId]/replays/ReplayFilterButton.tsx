'use client';

import { Button, Column, Label, Row, Text, TextField } from '@umami/react-zen';
import { useId, useState } from 'react';
import { useMessages, useNavigation } from '@/components/hooks';
import { ListFilter } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

const DEFAULT_MIN_DURATION = '5';

function getMinDurationValue(value: unknown) {
  if (value === '0') {
    return '';
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return DEFAULT_MIN_DURATION;
  }

  return Number(value) > 0 ? value : DEFAULT_MIN_DURATION;
}

function ReplayFilterForm({ minDuration, onClose }: { minDuration: string; onClose?: () => void }) {
  const { t, labels, messages } = useMessages();
  const { router, updateParams } = useNavigation();
  const [value, setValue] = useState(minDuration);

  const handleChange = (nextValue: string) => {
    if (/^\d*$/.test(nextValue)) {
      setValue(nextValue);
    }
  };

  const handleReset = () => {
    setValue(DEFAULT_MIN_DURATION);
  };

  const handleApply = () => {
    const nextValue = value ? Number(value) : 0;

    router.push(
      updateParams({
        minDuration: nextValue > 0 ? nextValue : 0,
        page: 1,
      }),
    );

    onClose?.();
  };

  return (
    <Column width="320px" gap="4">
      <Column gap="2">
        <Label>{t(labels.minDurationSeconds)}</Label>
        <Text color="muted">{t(messages.replayMinDurationDescription)}</Text>
        <TextField
          value={value}
          onChange={handleChange}
          autoFocus
          autoComplete="off"
          inputMode="numeric"
          placeholder="10"
        />
      </Column>
      <Row alignItems="center" justifyContent="space-between" gap>
        <Button onPress={handleReset}>{t(labels.reset)}</Button>
        <Row alignItems="center" justifyContent="flex-end" gap>
          <Button onPress={onClose}>{t(labels.cancel)}</Button>
          <Button variant="primary" onPress={handleApply}>
            {t(labels.apply)}
          </Button>
        </Row>
      </Row>
    </Column>
  );
}

export function ReplayFilterButton() {
  const { t, labels } = useMessages();
  const { query } = useNavigation();
  const minDuration = getMinDurationValue(query.minDuration);
  const title = `${t(labels.replay)} ${t(labels.filter)}`;
  const label = minDuration ? `${title} (${minDuration}s+)` : title;
  const hintId = useId();

  return (
    <>
      {/* what it asks for (guidelines 1.16); its label shows the value, so its id is pinned (2.4) */}
      <span id={hintId} hidden>
        {t(labels.minDurationSeconds)}
      </span>
      <DialogButton
        icon={<ListFilter />}
        label={label}
        title={title}
        variant="outline"
        aria-describedby={hintId}
        data-agentom-id="filter.replay"
      >
        {({ close }) => <ReplayFilterForm minDuration={minDuration} onClose={close} />}
      </DialogButton>
    </>
  );
}
