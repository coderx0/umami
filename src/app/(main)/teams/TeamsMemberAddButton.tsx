import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useId } from 'react';
import { useMessages, useModified } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { TeamMemberAddForm } from './TeamMemberAddForm';

export function TeamsMemberAddButton({
  teamId,
  onSave,
}: {
  teamId: string;
  onSave?: () => void;
  isAdmin?: boolean;
}) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const hintId = useId();

  const handleSave = async () => {
    toast(t(messages.saved));
    touch('teams:members');
    onSave?.();
  };

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.memberAddHint)}
      </span>
      <DialogTrigger>
        <Button aria-describedby={hintId} data-agentom-id="team.add-member">
          <Icon>
            <Plus />
          </Icon>
          <Text>{t(labels.addMember)}</Text>
        </Button>
        <Modal>
          <Dialog title={t(labels.addMember)} style={{ width: 400 }}>
            {({ close }) => (
              <TeamMemberAddForm teamId={teamId} onSave={handleSave} onClose={close} />
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </>
  );
}
