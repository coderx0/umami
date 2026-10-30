import { useId } from 'react';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { PixelEditForm } from './PixelEditForm';

export function PixelAddButton({ teamId }: { teamId?: string }) {
  const { t, labels, messages } = useMessages();
  const hintId = useId();

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.pixelAddHint)}
      </span>
      <DialogButton
        icon={<Plus />}
        label={t(labels.addPixel)}
        variant="primary"
        width="600px"
        aria-describedby={hintId}
        data-agentom-id="pixel.add"
      >
        {({ close }) => <PixelEditForm teamId={teamId} onClose={close} />}
      </DialogButton>
    </>
  );
}
