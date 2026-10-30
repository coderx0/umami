import { useId } from 'react';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { GoalEditForm } from './GoalEditForm';

export function GoalAddButton({ websiteId }: { websiteId: string }) {
  const { t, labels, messages } = useMessages();
  const hintId = useId();

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.goalAddHint)}
      </span>
      <DialogButton
        variant="primary"
        icon={<Plus />}
        label={t(labels.goal)}
        title={t(labels.goal)}
        minWidth="400px"
        minHeight="300px"
        aria-label={t(labels.addGoal)}
        aria-describedby={hintId}
        data-agentom-id="goal.add"
      >
        {({ close }) => <GoalEditForm websiteId={websiteId} onClose={close} />}
      </DialogButton>
    </>
  );
}
