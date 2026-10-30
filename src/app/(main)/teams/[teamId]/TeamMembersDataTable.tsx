import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useTeamMembersQuery } from '@/components/hooks';
import { TeamMembersTable } from './TeamMembersTable';

export function TeamMembersDataTable({
  teamId,
  allowEdit = false,
}: {
  teamId: string;
  allowEdit?: boolean;
}) {
  const queryResult = useTeamMembersQuery(teamId);

  const { t, messages } = useMessages();

  return (
    <DataGrid query={queryResult} allowSearch searchDescription={t(messages.membersSearchRule)}>
      {({ data }) => <TeamMembersTable data={data} teamId={teamId} allowEdit={allowEdit} />}
    </DataGrid>
  );
}
