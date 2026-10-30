import { useId } from 'react';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { SegmentEditForm } from './SegmentEditForm';

export function SegmentAddButton({ websiteId }: { websiteId: string }) {
  const { t, labels, messages } = useMessages();
  const hintId = useId();

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.segmentAddHint)}
      </span>
      <DialogButton
        icon={<Plus />}
        label={t(labels.segment)}
        variant="primary"
        width="800px"
        aria-label={t(labels.addSegment)}
        aria-describedby={hintId}
        data-agentom-id="segment.add"
      >
        {({ close }) => {
          return <SegmentEditForm websiteId={websiteId} onClose={close} />;
        }}
      </DialogButton>
    </>
  );
}
