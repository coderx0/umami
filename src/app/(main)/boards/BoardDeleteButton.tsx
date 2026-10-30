import { useId } from 'react';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

export function BoardDeleteButton({
  boardId,
  name,
  onSave,
}: {
  boardId: string;
  name: string;
  onSave?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(`/boards/${boardId}`);
  const confirmId = useId();

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('boards');
        onSave?.();
        close();
      },
    });
  };

  return (
    <>
      {/* what it asks before deleting (it opens a confirmation, guidelines 1.16) */}
      <span id={confirmId} hidden>
        {t.rich(messages.confirmRemove, { target: name, b: chunks => <b>{chunks}</b> })}
      </span>
      <DialogButton
        icon={<Trash />}
        title={t(labels.confirm)}
        variant="quiet"
        width="400px"
        aria-label={t(labels.delete)}
        aria-describedby={confirmId}
        data-agentom-id={`board.${boardId}.delete`}
      >
        {({ close }) => (
          <ConfirmationForm
            message={t.rich(messages.confirmRemove, {
              target: name,
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
