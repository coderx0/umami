import { useId } from 'react';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

export function ShareDeleteButton({
  shareId,
  slug,
  onSave,
}: {
  shareId: string;
  slug: string;
  onSave?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, isPending, error } = useDeleteQuery(`/share/id/${shareId}`);
  const { touch } = useModified();
  const confirmId = useId();

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('shares');
        onSave?.();
        close();
      },
    });
  };

  return (
    <>
      {/* what it asks before deleting (it opens a confirmation, guidelines 1.16) */}
      <span id={confirmId} hidden>
        {t.rich(messages.confirmRemove, { target: slug, b: chunks => <b>{chunks}</b> })}
      </span>
      <DialogButton
        icon={<Trash />}
        title={t(labels.confirm)}
        variant="quiet"
        width="400px"
        aria-label={t(labels.delete)}
        aria-describedby={confirmId}
        data-agentom-id={`share.${shareId}.delete`}
      >
        {({ close }) => (
          <ConfirmationForm
            message={t.rich(messages.confirmRemove, {
              target: slug,
              b: chunks => <b>{chunks}</b>,
            })}
            isLoading={isPending}
            error={getErrorMessage(error)}
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
            buttonLabel={t(labels.delete)}
            buttonVariant="danger"
          />
        )}
      </DialogButton>
    </>
  );
}
