import { Button, DataColumn, DataTable, type DataTableProps, Icon } from '@umami/react-zen';
import { Play } from 'lucide-react';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages, useNavigation } from '@/components/hooks';

export function SavedReplaysTable({ ...props }: DataTableProps) {
  const { t, labels } = useMessages();
  const { router, updateParams } = useNavigation();

  // the table named, and each row's Play icon by the saved replay's name: it opens
  // the player, paused (guidelines 1.3)
  return (
    <DataTable aria-label={t(labels.saved)} {...props}>
      <DataColumn id="play" label="" width="80px">
        {(row: any) => (
          <Button
            variant="quiet"
            onClick={() => router.push(updateParams({ replay: row.visitId }))}
            aria-label={`${t(labels.viewDetails)}: ${t(labels.replay)} ${row.name}`}
            data-agentom-id={`saved-replay.${row.id}.open`}
          >
            <Icon>
              <Play />
            </Icon>
          </Button>
        )}
      </DataColumn>
      <DataColumn id="name" label={t(labels.name)} />
      <DataColumn id="visitId" label={t(labels.replayId)} />
      <DataColumn id="createdAt" label={t(labels.created)} width="160px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
