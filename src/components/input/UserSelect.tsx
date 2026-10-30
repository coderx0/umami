import { ListItem, Select, type SelectProps } from '@umami/react-zen';
import { useId, useMemo, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { useMessages, useTeamMembersQuery, useUsersQuery } from '@/components/hooks';

export function UserSelect({
  teamId,
  onChange,
  ...props
}: {
  teamId?: string;
} & SelectProps) {
  const { t, labels, messages } = useMessages();
  const choicesId = useId();
  const { data: users, isLoading: usersLoading } = useUsersQuery();
  const { data: teamMembers, isLoading: teamMembersLoading } = useTeamMembersQuery(teamId);
  const [username, setUsername] = useState<string>();
  const [search, setSearch] = useState('');

  const listItems = useMemo(() => {
    if (!users) {
      return [];
    }
    if (!teamId || !teamMembers) {
      return users.data;
    }
    const teamMemberIds = teamMembers.data.map(({ userId }) => userId);
    return users.data.filter(({ id }) => !teamMemberIds.includes(id));
  }, [users, teamMembers, teamId]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleOpenChange = () => {
    setSearch('');
  };

  const handleChange = (id: string) => {
    setUsername(listItems.find(item => item.id === id)?.username);
    onChange(id);
  };

  // what the select offers, from the same users it lists (guidelines 1.16)
  return (
    <>
      <span id={choicesId} hidden>
        {`${t(labels.choices)}: ${listItems.map(({ username }) => username).join(', ')}`}
      </span>
      <Select
        {...props}
        buttonProps={{ ...props.buttonProps, 'aria-describedby': choicesId }}
        value={username}
        isLoading={usersLoading || (teamId && teamMembersLoading)}
        allowSearch={true}
        searchValue={search}
        onSearch={handleSearch}
        onChange={value => handleChange(value as string)}
        onOpenChange={handleOpenChange}
        maxHeight={480}
        listProps={{
          renderEmptyState: () => <Empty message={t(messages.noResultsFound)} />,
        }}
      >
        {listItems.map(({ id, username }) => (
          <ListItem key={id} id={id}>
            {username}
          </ListItem>
        ))}
      </Select>
    </>
  );
}
