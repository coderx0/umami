import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useId } from 'react';
import { useMessages, useModified } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { UserAddForm } from './UserAddForm';

export function UserAddButton({ onSave }: { onSave?: () => void }) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const hintId = useId();

  const handleSave = () => {
    toast(t(messages.saved));
    touch('users');
    onSave?.();
  };

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.userAddHint)}
      </span>
      <DialogTrigger>
        <Button
          variant="primary"
          data-test="button-create-user"
          aria-describedby={hintId}
          data-agentom-id="user.add"
        >
          <Icon>
            <Plus />
          </Icon>
          <Text>{t(labels.createUser)}</Text>
        </Button>
        <Modal>
          <Dialog title={t(labels.createUser)} style={{ width: 400 }}>
            {({ close }) => <UserAddForm onSave={handleSave} onClose={close} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </>
  );
}
