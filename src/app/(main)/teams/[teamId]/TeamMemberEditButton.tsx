import { useToast } from '@umami/react-zen';
import { useId } from 'react';
import { useMessages, useModified } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { TeamMemberEditForm } from './TeamMemberEditForm';

export function TeamMemberEditButton({
  teamId,
  userId,
  userName,
  role,
  onSave,
}: {
  teamId: string;
  userId: string;
  /** says which member it edits, where there are several */
  userName?: string;
  role: string;
  onSave?: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const hintId = useId();

  const handleSave = () => {
    touch('teams:members');
    toast(t(messages.saved));
    onSave?.();
  };

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.memberEditHint)}
      </span>
      <DialogButton
        icon={<Edit />}
        title={t(labels.editMember)}
        variant="quiet"
        width="400px"
        aria-label={userName ? `${t(labels.editMember)}: ${userName}` : t(labels.editMember)}
        aria-describedby={hintId}
        data-agentom-id={`member.${userId}.edit`}
      >
        {({ close }) => (
          <TeamMemberEditForm
            teamId={teamId}
            userId={userId}
            role={role}
            onSave={handleSave}
            onClose={close}
          />
        )}
      </DialogButton>
    </>
  );
}
