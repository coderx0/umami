'use client';

import { useId } from 'react';
import { useMessages } from '@/components/hooks';
import type { PropertyDataSource } from '@/components/hooks/queries/usePropertyFieldsQuery';
import { ListFilter } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import type { PropertyFilter } from '@/lib/types';
import { PropertyFilterEditForm } from './PropertyFilterEditForm';

export function PropertyFilterButton({
  source,
  websiteId,
  eventName,
  fields,
  filters,
  onApply,
}: {
  source: PropertyDataSource;
  websiteId: string;
  eventName?: string;
  fields?: Array<{ propertyName: string; dataType: number }>;
  filters: PropertyFilter[];
  onApply: (filters: PropertyFilter[]) => void;
}) {
  const { t, labels, messages } = useMessages();
  const hintId = useId();

  // what the dialog asks for (guidelines 1.16)
  return (
    <>
      <span id={hintId} hidden>
        {t(messages.propertyFilterHint)}
      </span>
      <DialogButton
        icon={<ListFilter />}
        label={t(labels.propertyFilter)}
        variant="outline"
        aria-describedby={hintId}
        data-agentom-id="filter.property"
      >
        {({ close }) => (
          <PropertyFilterEditForm
            source={source}
            websiteId={websiteId}
            eventName={eventName}
            fields={fields}
            value={filters}
            onApply={onApply}
            onClose={close}
          />
        )}
      </DialogButton>
    </>
  );
}
