import { Button, ListItem, Row, Select } from '@umami/react-zen';
import { useId, useState } from 'react';
import { useLocale, useMessages } from '@/components/hooks';
import { DEFAULT_LOCALE } from '@/lib/constants';
import { languages } from '@/lib/lang';

export function LanguageSetting() {
  const [search, setSearch] = useState('');
  const { t, labels, messages } = useMessages();
  const choicesId = useId();
  const { locale, saveLocale } = useLocale();
  const items = search
    ? Object.keys(languages).filter(n => {
        return (
          n.toLowerCase().includes(search.toLowerCase()) ||
          languages[n].label.toLowerCase().includes(search.toLowerCase())
        );
      })
    : Object.keys(languages);

  const handleReset = () => saveLocale(DEFAULT_LOCALE);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setSearch('');
    }
  };

  return (
    <Row gap>
      {/* what the select offers, named before it opens (guidelines 1.16) */}
      <span id={choicesId} hidden>
        {`${t(labels.choices)}: ${Object.values(languages)
          .map(({ label }) => label)
          .join(', ')}. ${t(messages.languageSearchRule)}`}
      </span>
      <Select
        value={locale}
        onChange={val => saveLocale(val as string)}
        allowSearch
        onSearch={setSearch}
        onOpenChange={handleOpen}
        maxHeight={480}
        buttonProps={{
          style: { minWidth: '250px' },
          'aria-label': t(labels.language),
          'aria-describedby': choicesId,
        }}
      >
        {items.map(item => (
          <ListItem key={item} id={item}>
            {languages[item].label}
          </ListItem>
        ))}
        {!items.length && <ListItem></ListItem>}
      </Select>
      <Button
        onPress={handleReset}
        aria-label={t(labels.resetSetting, { setting: t(labels.language) })}
      >
        {t(labels.reset)}
      </Button>
    </Row>
  );
}
