import { Button, Dialog, DialogTrigger, Icon, Modal, Text } from '@umami/react-zen';
import { useId } from 'react';
import { useMessages, useModified } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { ApiKeyAddForm } from './ApiKeyAddForm';

export function ApiKeyAddButton({ onSave }: { onSave?: () => void }) {
  const { t, labels, messages } = useMessages();
  const { touch } = useModified();
  const hintId = useId();

  const handleSave = () => {
    touch('api-keys');
    onSave?.();
  };

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.apiKeyAddHint)}
      </span>
      <DialogTrigger>
        <Button variant="primary" aria-describedby={hintId} data-agentom-id="api-key.add">
          <Icon>
            <Plus />
          </Icon>
          <Text>{t(labels.createApiKey)}</Text>
        </Button>
        <Modal>
          <Dialog title={t(labels.createApiKey)} style={{ width: 480 }}>
            {({ close }) => <ApiKeyAddForm onSave={handleSave} onClose={close} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </>
  );
}
