'use client';
import { Column, Grid, ListItem, Select } from '@umami/react-zen';
import { useId, useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Empty } from '@/components/common/Empty';
import { useDateRange, useMessages } from '@/components/hooks';
import { WebsiteValueComboBox } from '@/components/input/WebsiteValueComboBox';
import { Attribution } from './Attribution';

export function AttributionPage({ websiteId }: { websiteId: string }) {
  const [model, setModel] = useState('first-click');
  const [type, setType] = useState('path');
  const [step, setStep] = useState('');
  const { t, labels, messages } = useMessages();
  const modelChoicesId = useId();
  const typeChoicesId = useId();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();
  const handleTypeChange = (value: any) => {
    setType(value as string);
    setStep('');
  };

  return (
    <Column gap="6">
      <WebsiteControls websiteId={websiteId} />
      {/* what each select offers, named before it opens (guidelines 1.16) */}
      <span id={modelChoicesId} hidden>
        {`${t(labels.choices)}: ${t(labels.firstClick)}, ${t(labels.lastClick)}`}
      </span>
      <span id={typeChoicesId} hidden>
        {`${t(labels.choices)}: ${t(labels.viewedPage)}, ${t(labels.triggeredEvent)}`}
      </span>
      <Grid columns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap>
        <Column>
          <Select
            label={t(labels.model)}
            buttonProps={{ 'aria-describedby': modelChoicesId }}
            value={model}
            defaultValue={model}
            onChange={value => setModel(value as string)}
          >
            <ListItem id="first-click">{t(labels.firstClick)}</ListItem>
            <ListItem id="last-click">{t(labels.lastClick)}</ListItem>
          </Select>
        </Column>
        <Column>
          <Select
            label={t(labels.type)}
            buttonProps={{ 'aria-describedby': typeChoicesId }}
            value={type}
            defaultValue={type}
            onChange={handleTypeChange}
          >
            <ListItem id="path">{t(labels.viewedPage)}</ListItem>
            <ListItem id="event">{t(labels.triggeredEvent)}</ListItem>
          </Select>
        </Column>
        <Column>
          <WebsiteValueComboBox
            label={t(labels.conversionStep)}
            description={t(messages.conversionStepHint)}
            websiteId={websiteId}
            type={type}
            startDate={startDate}
            endDate={endDate}
            value={step}
            onChange={setStep}
          />
        </Column>
      </Grid>
      {step ? (
        <Attribution
          websiteId={websiteId}
          startDate={startDate}
          endDate={endDate}
          model={model}
          type={type}
          step={step}
        />
      ) : (
        <Empty />
      )}
    </Column>
  );
}
