import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useId } from 'react';
import { useMessages, useModified } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { TeamAddForm } from './TeamAddForm';

export function TeamsAddButton({
  onSave,
  isAdmin = false,
}: {
  onSave?: () => void;
  isAdmin?: boolean;
}) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const hintId = useId();

  const handleSave = async () => {
    toast(t(messages.saved));
    touch('teams');
    onSave?.();
  };

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(isAdmin ? messages.teamAddAdminHint : messages.teamAddHint)}
      </span>
      <DialogTrigger>
        <Button variant="primary" aria-describedby={hintId} data-agentom-id="team.add">
          <Icon>
            <Plus />
          </Icon>
          <Text>{t(labels.createTeam)}</Text>
        </Button>
        <Modal>
          <Dialog title={t(labels.createTeam)} style={{ width: 400 }}>
            {({ close }) => <TeamAddForm onSave={handleSave} onClose={close} isAdmin={isAdmin} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </>
  );
}
