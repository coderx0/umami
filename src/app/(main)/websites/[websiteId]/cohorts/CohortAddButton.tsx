import { useId } from 'react';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { CohortEditForm } from './CohortEditForm';

export function CohortAddButton({ websiteId }: { websiteId: string }) {
  const { t, labels, messages } = useMessages();
  const hintId = useId();

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.cohortAddHint)}
      </span>
      <DialogButton
        icon={<Plus />}
        label={t(labels.cohort)}
        variant="primary"
        width="800px"
        aria-label={t(labels.addCohort)}
        aria-describedby={hintId}
        data-agentom-id="cohort.add"
      >
        {({ close }) => {
          return <CohortEditForm websiteId={websiteId} onClose={close} />;
        }}
      </DialogButton>
    </>
  );
}
