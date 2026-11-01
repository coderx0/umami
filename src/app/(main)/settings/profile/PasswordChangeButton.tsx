import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useId } from 'react';
import { useMessages } from '@/components/hooks';
import { LockKeyhole } from '@/components/icons';
import { PasswordEditForm } from './PasswordEditForm';

export function PasswordChangeButton() {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const hintId = useId();

  const handleSave = () => {
    toast(t(messages.passwordChanged));
  };

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.passwordChangeHint)}
      </span>
      <DialogTrigger>
        <Button aria-describedby={hintId} data-agentom-id="profile.change-password">
          <Icon>
            <LockKeyhole />
          </Icon>
          <Text>{t(labels.changePassword)}</Text>
        </Button>
        <Modal>
          <Dialog title={t(labels.changePassword)} style={{ width: 400 }}>
            {({ close }) => <PasswordEditForm onSave={handleSave} onClose={close} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </>
  );
}
