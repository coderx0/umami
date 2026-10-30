import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useNavigation, useWebsiteSessionsQuery } from '@/components/hooks';
import { SessionsTable } from './SessionsTable';

export function SessionsDataTable({ websiteId }: { websiteId: string }) {
  const queryResult = useWebsiteSessionsQuery(websiteId);
  const { updateParams } = useNavigation();
  const { t, messages } = useMessages();

  return (
    <DataGrid
      query={queryResult}
      allowPaging
      allowSearch
      searchDescription={t(messages.sessionsSearchRule)}
    >
      {({ data }) => (
        <SessionsTable
          data={data}
          websiteId={websiteId}
          getSessionHref={row => updateParams({ session: row.id })}
        />
      )}
    </DataGrid>
  );
}
