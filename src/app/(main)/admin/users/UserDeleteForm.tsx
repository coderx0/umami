import { Dialog } from '@umami/react-zen';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';

export function UserDeleteForm({
  userId,
  username,
  onSave,
  onClose,
}: {
  userId: string;
  username: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { messages, labels, t, getErrorMessage } = useMessages();
  const { mutateAsync, isPending, error } = useDeleteQuery(`/users/${userId}`);
  const { touch } = useModified();

  const handleConfirm = async () => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch('users');
        touch(`users:${userId}`);
        onSave?.();
        onClose?.();
      },
    });
  };

  // a confirmation whose button is marked destructive (guidelines 4.1)
  return (
    <Dialog title={t(labels.deleteUser)} style={{ width: 400 }}>
      <ConfirmationForm
        message={t(messages.confirmDelete, { target: username })}
        isLoading={isPending}
        error={getErrorMessage(error)}
        onConfirm={handleConfirm}
        onClose={onClose}
        buttonLabel={t(labels.delete)}
        buttonVariant="danger"
      />
    </Dialog>
  );
}
