import { useId } from 'react';
import { useDateParameters, useMessages } from '@/components/hooks';
import { MessageSquareText } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { AnnotationsModal } from './AnnotationsModal';

export function AnnotationsButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { startAt, endAt } = useDateParameters();
  const choicesId = useId();

  // what the dialog offers (named before it opens)
  return (
    <>
      <span id={choicesId} hidden>
        {`${t(labels.choices)}: ${t(labels.current)} ${t(labels.dateRange)}, ${t(labels.all)} ${t(labels.notes)}; ${t(labels.addNote)}`}
      </span>
      <DialogButton
        aria-describedby={choicesId}
        data-agentom-id="notes.open"
        icon={<MessageSquareText />}
        label={t(labels.notes)}
        title={null}
        variant="quiet"
        width="800px"
      >
        {({ close }) => (
          <AnnotationsModal websiteId={websiteId} range={{ startAt, endAt }} onClose={close} />
        )}
      </DialogButton>
    </>
  );
}
