import {
  Button,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Icon,
  Label,
  Loading,
  Row,
  TextField,
} from '@umami/react-zen';
import { useEffect, useId, useState } from 'react';
import { useConfig, useMessages, usePixelQuery } from '@/components/hooks';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';
import { RefreshCw } from '@/components/icons';
import { PIXELS_URL } from '@/lib/constants';
import { getRandomChars } from '@/lib/generate';

const generateId = () => getRandomChars(9);

export function PixelEditForm({
  pixelId,
  teamId,
  onSave,
  onClose,
}: {
  pixelId?: string;
  teamId?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const regenerateHintId = useId();
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    pixelId ? `/pixels/${pixelId}` : '/pixels',
    {
      id: pixelId,
      teamId,
    },
  );
  const config = useConfig();
  const pixelsUrl = config?.pixelsUrl;
  const hostUrl = pixelsUrl || PIXELS_URL;
  const { data, isLoading } = usePixelQuery(pixelId);
  const [slug, setSlug] = useState(generateId());

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(t(messages.saved));
        touch('pixels');
        touch(`pixel:${pixelId}`);
        onSave?.();
        onClose?.();
      },
    });
  };

  const handleSlug = () => {
    const slug = generateId();

    setSlug(slug);

    return slug;
  };

  useEffect(() => {
    if (data) {
      setSlug(data.slug);
    }
  }, [data]);

  if (pixelId && isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      defaultValues={{ slug, ...data }}
      aria-label={t(labels.pixel)}
    >
      {({ setValue }) => {
        return (
          <>
            <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
              <TextField autoComplete="off" aria-required />
            </FormField>

            <FormField
              name="slug"
              rules={{
                required: t(labels.required),
              }}
              style={{ display: 'none' }}
            >
              <input type="hidden" />
            </FormField>

            <Column gap="1">
              <Label>{t(labels.link)}</Label>
              <Row alignItems="center" gap>
                <TextField
                  value={`${hostUrl}/${slug}`}
                  autoComplete="off"
                  isReadOnly
                  allowCopy
                  aria-label={t(labels.link)}
                  style={{ width: '100%' }}
                />
                <span id={regenerateHintId} hidden>
                  {t(messages.regenerateSlugHint)}
                </span>
                <Button
                  onPress={() => setValue('slug', handleSlug(), { shouldDirty: true })}
                  aria-label={t(labels.regenerateSlug)}
                  aria-describedby={regenerateHintId}
                  data-agentom-id="pixel.regenerate-slug"
                >
                  <Icon>
                    <RefreshCw />
                  </Icon>
                </Button>
              </Row>
            </Column>

            <Row justifyContent="flex-end" paddingTop="3" gap="3">
              {onClose && (
                <Button isDisabled={isPending} onPress={onClose}>
                  {t(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton isDisabled={false}>{t(labels.save)}</FormSubmitButton>
            </Row>
          </>
        );
      }}
    </Form>
  );
}
