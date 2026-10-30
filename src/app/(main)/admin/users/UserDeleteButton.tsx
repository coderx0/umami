import { Button, Icon, Modal, Text } from '@umami/react-zen';
import { useState } from 'react';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { UserDeleteForm } from './UserDeleteForm';

export function UserDeleteButton({
  userId,
  username,
  onDelete,
}: {
  userId: string;
  username: string;
  onDelete?: () => void;
}) {
  const { t, labels } = useMessages();
  const { user } = useLoginQuery();
  const [isOpen, setIsOpen] = useState(false);

  // UserDeleteForm is the dialog itself, so it opens in a modal of its own
  return (
    <>
      <Button
        isDisabled={userId === user?.id}
        data-test="button-delete"
        onPress={() => setIsOpen(true)}
      >
        <Icon size="sm">
          <Trash />
        </Icon>
        <Text>{t(labels.delete)}</Text>
      </Button>
      <ControlledDialog>
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
          <UserDeleteForm
            userId={userId}
            username={username}
            onSave={onDelete}
            onClose={() => setIsOpen(false)}
          />
        </Modal>
      </ControlledDialog>
    </>
  );
}
