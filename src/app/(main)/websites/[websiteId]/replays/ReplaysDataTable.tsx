import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useNavigation, useReplaysQuery } from '@/components/hooks';
import { ReplayFilterButton } from './ReplayFilterButton';
import { ReplaysTable } from './ReplaysTable';

const DEFAULT_MIN_DURATION = 5;

export function ReplaysDataTable({ websiteId }: { websiteId: string }) {
  const { t, messages } = useMessages();
  const { query } = useNavigation();
  const minDuration =
    typeof query.minDuration === 'string' && /^\d+$/.test(query.minDuration)
      ? query.minDuration
      : String(DEFAULT_MIN_DURATION);
  const queryResult = useReplaysQuery(websiteId, { minDuration });

  return (
    <DataGrid
      query={queryResult}
      allowPaging
      allowSearch
      searchDescription={t(messages.replaysSearchRule)}
      renderActions={() => <ReplayFilterButton />}
    >
      {({ data }) => {
        return <ReplaysTable data={data} />;
      }}
    </DataGrid>
  );
}
