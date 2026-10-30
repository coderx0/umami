import { useId } from 'react';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { LinkEditForm } from './LinkEditForm';

export function LinkAddButton({ teamId }: { teamId?: string }) {
  const { t, labels, messages } = useMessages();
  const hintId = useId();

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.linkAddHint)}
      </span>
      <DialogButton
        icon={<Plus />}
        label={t(labels.addLink)}
        variant="primary"
        width="600px"
        aria-describedby={hintId}
        data-agentom-id="link.add"
      >
        {({ close }) => <LinkEditForm teamId={teamId} onClose={close} />}
      </DialogButton>
    </>
  );
}
