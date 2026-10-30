import { Button, Dialog, DialogTrigger, Grid, Icon, Popover, Text } from '@umami/react-zen';
import { Globe } from 'lucide-react';
import { useId } from 'react';
import { useLocale, useMessages } from '@/components/hooks';
import { languages } from '@/lib/lang';

export function LanguageButton() {
  const { locale, saveLocale } = useLocale();
  const { t, labels } = useMessages();
  const choicesId = useId();
  const items = Object.keys(languages).map(key => ({ ...languages[key], value: key }));

  function handleSelect(value: string, close: () => void) {
    saveLocale(value);
    close();
  }

  return (
    <>
      {/* what it offers, named before it opens (guidelines 1.16) */}
      <span id={choicesId} hidden>
        {`${t(labels.choices)}: ${items.map(({ label }) => label).join(', ')}`}
      </span>
      <DialogTrigger key="language">
        <Button
          variant="quiet"
          aria-label={t(labels.language)}
          aria-describedby={choicesId}
          data-agentom-id="language"
        >
          <Icon color="primary">
            <Globe />
          </Icon>
        </Button>
        <Popover side="bottom" align="end">
          <Dialog>
            {({ close }) => (
              // one choice of language: a radio group whose language in use is
              // checked, not only bold (guidelines 1.4)
              <Grid
                columns="repeat(3, minmax(200px, 1fr))"
                overflow="hidden"
                role="radiogroup"
                aria-label={t(labels.language)}
              >
                {items.map(({ value, label }) => {
                  return (
                    <Button
                      key={value}
                      variant="quiet"
                      onPress={() => handleSelect(value, close)}
                      role="radio"
                      aria-checked={value === locale}
                    >
                      <Text
                        weight={value === locale ? 'bold' : 'medium'}
                        color={value === locale ? undefined : 'muted'}
                      >
                        {label}
                      </Text>
                    </Button>
                  );
                })}
              </Grid>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    </>
  );
}
