import { useId } from 'react';
import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { SimpleShareEditForm } from './SimpleShareEditForm';

export function SimpleShareEditButton({ shareId }: { shareId: string }) {
  const { t, labels, messages } = useMessages();
  const hintId = useId();

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.shareEditHint)}
      </span>
      <DialogButton
        icon={<Edit />}
        title={t(labels.share)}
        variant="quiet"
        width="600px"
        aria-label={t(labels.edit)}
        aria-describedby={hintId}
        data-agentom-id={`share.${shareId}.edit`}
      >
        {({ close }) => <SimpleShareEditForm shareId={shareId} onClose={close} />}
      </DialogButton>
    </>
  );
}
