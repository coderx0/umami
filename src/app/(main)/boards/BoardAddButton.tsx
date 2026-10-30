import { useId } from 'react';
import { useMessages, useNavigation } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import type { Board } from '@/lib/types';
import { BoardEditForm } from './BoardEditForm';

export function BoardAddButton() {
  const { t, labels, messages } = useMessages();
  const hintId = useId();
  const { teamId, router, renderUrl } = useNavigation();

  const handleSave = (board: Board) => {
    router.push(renderUrl(`/boards/${board.id}/design`, false));
  };

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.boardAddHint)}
      </span>
      <DialogButton
        icon={<Plus />}
        label={t(labels.addBoard)}
        variant="primary"
        width="600px"
        aria-describedby={hintId}
        data-agentom-id="board.add"
      >
        {({ close }) => <BoardEditForm teamId={teamId} onSave={handleSave} onClose={close} />}
      </DialogButton>
    </>
  );
}
