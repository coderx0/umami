import { useId } from 'react';
import { useMessages, useNavigation } from '@/components/hooks';
import { Copy } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import type { Board } from '@/lib/types';
import { BoardCloneForm } from './BoardCloneForm';

export function BoardCloneButton({
  boardId,
  showLabel = false,
}: {
  boardId: string;
  showLabel?: boolean;
}) {
  const { router, renderUrl } = useNavigation();
  const { t, messages } = useMessages();
  const hintId = useId();

  const handleSave = (board: Board) => {
    router.push(renderUrl(`/boards/${board.id}/design`, false));
  };

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.boardCloneHint)}
      </span>
      <DialogButton
        icon={<Copy />}
        label={showLabel ? 'Clone' : undefined}
        title="Clone board"
        aria-label="Clone"
        aria-describedby={hintId}
        data-agentom-id="board.clone"
        variant={showLabel ? undefined : 'quiet'}
        width="600px"
      >
        {({ close }) => <BoardCloneForm boardId={boardId} onSave={handleSave} onClose={close} />}
      </DialogButton>
    </>
  );
}
