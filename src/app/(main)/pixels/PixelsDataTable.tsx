import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useNavigation, usePixelsQuery } from '@/components/hooks';
import { PixelsTable } from './PixelsTable';

export function PixelsDataTable({ showActions = false }: { showActions?: boolean }) {
  const { teamId } = useNavigation();
  const query = usePixelsQuery({ teamId });
  const { t, messages } = useMessages();

  return (
    <DataGrid
      query={query}
      allowSearch={true}
      searchDescription={t(messages.pixelsSearchRule)}
      autoFocus={false}
      allowPaging={true}
    >
      {({ data }) => <PixelsTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
