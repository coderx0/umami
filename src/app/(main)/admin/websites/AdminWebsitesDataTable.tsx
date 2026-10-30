import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useWebsitesQuery } from '@/components/hooks';
import { AdminWebsitesTable } from './AdminWebsitesTable';

export function AdminWebsitesDataTable() {
  const query = useWebsitesQuery();
  const { t, messages } = useMessages();

  return (
    <DataGrid query={query} allowSearch={true} searchDescription={t(messages.websitesSearchRule)}>
      {props => <AdminWebsitesTable {...props} />}
    </DataGrid>
  );
}
