import { Button, LoadingButton, Row } from '@umami/react-zen';
import { useId } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useBoard, useMessages, useNavigation } from '@/components/hooks';

export function DashboardEditHeader() {
  const { saveBoard, isPending } = useBoard();
  const { t, labels, messages } = useMessages();
  const saveHintId = useId();
  const { router, renderUrl } = useNavigation();

  const handleSave = async () => {
    await saveBoard();
    router.push(renderUrl('/dashboard', false));
  };

  return (
    <PageHeader title={t(labels.dashboard)}>
      {/* what Save keeps (guidelines 1.19) */}
      <span id={saveHintId} hidden>
        {t(messages.dashboardSaveHint)}
      </span>
      <Row gap="3">
        <Button
          variant="quiet"
          onPress={() => router.push(renderUrl('/dashboard', false))}
          data-agentom-id="dashboard.cancel"
        >
          {t(labels.cancel)}
        </Button>
        <LoadingButton
          variant="primary"
          onPress={handleSave}
          isLoading={isPending}
          aria-describedby={saveHintId}
          data-agentom-id="dashboard.save"
        >
          {t(labels.save)}
        </LoadingButton>
      </Row>
    </PageHeader>
  );
}
