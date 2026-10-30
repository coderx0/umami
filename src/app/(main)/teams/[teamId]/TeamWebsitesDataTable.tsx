import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useTeamWebsitesQuery } from '@/components/hooks';
import { TeamWebsitesTable } from './TeamWebsitesTable';

export function TeamWebsitesDataTable({
  teamId,
  allowEdit = false,
}: {
  teamId: string;
  allowEdit?: boolean;
}) {
  const queryResult = useTeamWebsitesQuery(teamId);

  const { t, messages } = useMessages();

  return (
    <DataGrid query={queryResult} allowSearch searchDescription={t(messages.websitesSearchRule)}>
      {({ data }) => <TeamWebsitesTable data={data} teamId={teamId} allowEdit={allowEdit} />}
    </DataGrid>
  );
}
