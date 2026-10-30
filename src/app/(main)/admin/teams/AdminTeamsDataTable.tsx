import type { ReactNode } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useTeamsQuery } from '@/components/hooks';
import { AdminTeamsTable } from './AdminTeamsTable';

export function AdminTeamsDataTable({
  showActions,
}: {
  showActions?: boolean;
  children?: ReactNode;
}) {
  const queryResult = useTeamsQuery();
  const { t, messages } = useMessages();

  return (
    <DataGrid
      query={queryResult}
      allowSearch={true}
      searchDescription={t(messages.teamsSearchRule)}
    >
      {({ data }) => <AdminTeamsTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
