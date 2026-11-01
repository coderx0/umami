import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useId } from 'react';
import { useMessages, useModified } from '@/components/hooks';
import { UserPlus } from '@/components/icons';
import { TeamJoinForm } from './TeamJoinForm';

export function TeamsJoinButton() {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const hintId = useId();

  const handleJoin = () => {
    toast(t(messages.teamJoined));
    touch('teams');
  };

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.teamJoinHint)}
      </span>
      <DialogTrigger>
        <Button aria-describedby={hintId} data-agentom-id="team.join">
          <Icon>
            <UserPlus />
          </Icon>
          <Text>{t(labels.joinTeam)}</Text>
        </Button>
        <Modal>
          <Dialog title={t(labels.joinTeam)} style={{ width: 400 }}>
            {({ close }) => <TeamJoinForm onSave={handleJoin} onClose={close} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </>
  );
}
