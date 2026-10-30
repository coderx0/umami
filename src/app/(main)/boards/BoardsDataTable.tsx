import { DataGrid } from '@/components/common/DataGrid';
import { useBoardsQuery, useMessages, useNavigation } from '@/components/hooks';
import { BoardsTable } from './BoardsTable';

export function BoardsDataTable() {
  const { teamId } = useNavigation();
  const query = useBoardsQuery({ teamId });
  const { t, messages } = useMessages();

  return (
    <DataGrid
      query={query}
      allowSearch={true}
      searchDescription={t(messages.boardsSearchRule)}
      autoFocus={false}
      allowPaging={true}
    >
      {({ data }) => <BoardsTable data={data} />}
    </DataGrid>
  );
}
