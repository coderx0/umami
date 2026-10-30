import { ListItem, Select } from '@umami/react-zen';
import { useId, useState } from 'react';
import { useMessages } from '@/components/hooks';
import { CURRENCIES } from '@/lib/constants';

export function CurrencySelect({ value, onChange }) {
  const { t, labels, messages } = useMessages();
  const [search, setSearch] = useState('');
  const choicesId = useId();

  return (
    <>
      {/* what the select offers, named before it opens (guidelines 1.16) */}
      <span id={choicesId} hidden>
        {`${t(labels.choices)}: ${CURRENCIES.map(({ id }) => id).join(', ')}. ${t(messages.currencySearchRule)}`}
      </span>
      <Select
        label={t(labels.currency)}
        value={value}
        defaultValue={value}
        onChange={onChange}
        maxHeight={480}
        onSearch={setSearch}
        allowSearch
        buttonProps={{ 'aria-describedby': choicesId }}
      >
        {CURRENCIES.map(({ id, name }) => {
          if (search && !`${id}${name}`.toLowerCase().includes(search.toLowerCase())) {
            return null;
          }

          return (
            <ListItem key={id} id={id}>
              {id} &mdash; {name}
            </ListItem>
          );
        }).filter(n => n)}
      </Select>
    </>
  );
}
