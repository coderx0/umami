import { type ComboBoxProps, ListItem, Loading, useDebounce } from '@umami/react-zen';
import { endOfDay, subMonths } from 'date-fns';
import { type SetStateAction, useId, useMemo, useState } from 'react';
import { ComboBox } from '@/components/common/ComboBox';
import { Empty } from '@/components/common/Empty';
import { useMessages, useWebsiteValuesQuery } from '@/components/hooks';

export interface LookupFieldProps extends Omit<ComboBoxProps, 'onChange'> {
  websiteId: string;
  type: string;
  value: string;
  allowCustomValue?: boolean;
  /** how the form uses the value, said after what the field suggests */
  matchHint?: string;
  onChange: (value: string) => void;
  onValueChange?: (value: string) => void;
}

export function LookupField({
  websiteId,
  type,
  value,
  allowCustomValue,
  matchHint,
  onChange,
  onValueChange,
  ...props
}: LookupFieldProps) {
  const { t, labels, messages } = useMessages();
  const hintId = useId();
  const [search, setSearch] = useState(value);
  const searchValue = useDebounce(search, 300);
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());

  const { data, isLoading } = useWebsiteValuesQuery({
    websiteId,
    type,
    search: searchValue,
    startDate,
    endDate,
  });

  const items: string[] = useMemo(() => {
    return data?.map(({ value }) => value) || [];
  }, [data]);

  const options = useMemo(() => {
    if (allowCustomValue && value && !items.includes(value)) {
      return [value, ...items];
    }

    return items;
  }, [allowCustomValue, items, value]);

  const handleSearch = (value: SetStateAction<string>) => {
    setSearch(value);
  };

  return (
    <>
      <span id={hintId} hidden>
        {t(messages.lookupHint)}
        {matchHint ? ` ${matchHint}` : ''}
      </span>
      <ComboBox
        {...props}
        inputProps={{
          'aria-label': props['aria-label'] ?? t(labels?.[type] ?? type),
          'aria-describedby': hintId,
          'aria-required': props['aria-required'],
        }}
        items={options}
        inputValue={value}
        onInputValueChange={value => {
          handleSearch(value);
          onChange?.(value);
          onValueChange?.(value);
        }}
        renderEmptyState={() =>
          isLoading ? (
            <Loading placement="center" icon="dots" />
          ) : (
            <Empty message={t(messages.noResultsFound)} />
          )
        }
      >
        {options.map(item => (
          <ListItem key={item} id={item}>
            {item}
          </ListItem>
        ))}
      </ComboBox>
    </>
  );
}
