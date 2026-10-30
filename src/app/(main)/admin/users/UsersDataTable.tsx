import type { ReactNode } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useUsersQuery } from '@/components/hooks';
import { UsersTable } from './UsersTable';

export function UsersDataTable({ showActions }: { showActions?: boolean; children?: ReactNode }) {
  const queryResult = useUsersQuery();
  const { t, messages } = useMessages();

  return (
    <DataGrid
      query={queryResult}
      allowSearch={true}
      searchDescription={t(messages.usersSearchRule)}
    >
      {({ data }) => <UsersTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
