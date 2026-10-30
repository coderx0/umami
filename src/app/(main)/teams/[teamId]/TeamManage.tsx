import { Button, Dialog, DialogTrigger, Modal } from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import { ActionForm } from '@/components/common/ActionForm';
import { useMessages, useModified } from '@/components/hooks';
import { TeamDeleteForm } from './TeamDeleteForm';

export function TeamManage({ teamId }: { teamId: string }) {
  const { t, labels, messages } = useMessages();
  const router = useRouter();
  const { touch } = useModified();
  const deleteHintId = useId();

  const handleLeave = async () => {
    touch('teams');
    router.push('/settings/teams');
  };

  return (
    <ActionForm label={t(labels.deleteTeam)} description={t(messages.deleteTeamWarning)}>
      {/* what it opens and does, in the words shown beside it (guidelines 1.16) */}
      <span id={deleteHintId} hidden>
        {t(messages.deleteTeamWarning)}
      </span>
      <DialogTrigger>
        <Button
          variant="danger"
          aria-label={t(labels.deleteTeam)}
          aria-describedby={deleteHintId}
          data-agentom-id="team.delete"
        >
          {t(labels.delete)}
        </Button>
        <Modal>
          <Dialog title={t(labels.deleteTeam)} style={{ width: 400 }}>
            {({ close }) => <TeamDeleteForm teamId={teamId} onSave={handleLeave} onClose={close} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </ActionForm>
  );
}
