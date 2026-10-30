import { DataGrid } from '@/components/common/DataGrid';
import { useLinksQuery, useMessages, useNavigation } from '@/components/hooks';
import { LinksTable } from './LinksTable';

export function LinksDataTable({ showActions = false }: { showActions?: boolean }) {
  const { teamId } = useNavigation();
  const query = useLinksQuery({ teamId });
  const { t, messages } = useMessages();

  return (
    <DataGrid
      query={query}
      allowSearch={true}
      searchDescription={t(messages.linksSearchRule)}
      autoFocus={false}
      allowPaging={true}
    >
      {({ data }) => <LinksTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
