import { useId } from 'react';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { FunnelEditForm } from './FunnelEditForm';

export function FunnelAddButton({ websiteId }: { websiteId: string }) {
  const { t, labels, messages } = useMessages();
  const hintId = useId();

  return (
    <>
      {/* what the dialog asks for (guidelines 1.16) */}
      <span id={hintId} hidden>
        {t(messages.funnelAddHint)}
      </span>
      <DialogButton
        variant="primary"
        icon={<Plus />}
        label={t(labels.funnel)}
        title={t(labels.funnel)}
        width="700px"
        height="600px"
        aria-label={t(labels.addFunnel)}
        aria-describedby={hintId}
        data-agentom-id="funnel.add"
      >
        {({ close }) => <FunnelEditForm websiteId={websiteId} onClose={close} />}
      </DialogButton>
    </>
  );
}
