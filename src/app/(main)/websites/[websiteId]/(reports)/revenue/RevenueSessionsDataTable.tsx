import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useNavigation, useRevenueSessionsQuery } from '@/components/hooks';
import { SessionsTable } from '../../sessions/SessionsTable';

export interface RevenueSessionsDataTableProps {
  websiteId: string;
  currency: string;
}

export function RevenueSessionsDataTable({ websiteId, currency }: RevenueSessionsDataTableProps) {
  const { t, messages } = useMessages();
  const { updateParams } = useNavigation();
  const queryResult = useRevenueSessionsQuery(websiteId, currency);

  return (
    <DataGrid
      query={queryResult}
      allowPaging
      allowSearch
      searchDescription={t(messages.customersSearchRule)}
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
