import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useSavedReplaysQuery } from '@/components/hooks';
import { SavedReplaysTable } from './SavedReplaysTable';

export function SavedReplaysDataTable({ websiteId }: { websiteId: string }) {
  const { t, messages } = useMessages();
  const queryResult = useSavedReplaysQuery(websiteId);

  return (
    <DataGrid
      query={queryResult}
      allowPaging
      allowSearch
      searchDescription={t(messages.savedReplaysSearchRule)}
    >
      {({ data }) => {
        return <SavedReplaysTable data={data} />;
      }}
    </DataGrid>
  );
}
