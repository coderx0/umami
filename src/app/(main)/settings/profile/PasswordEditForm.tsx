import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  PasswordField,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';

export function PasswordEditForm({ onSave, onClose }) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery('/me/password');

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        onSave();
        onClose();
      },
    });
  };

  const samePassword = (value: string, values: Record<string, any>) => {
    if (value !== values.newPassword) {
      return t(messages.noMatchPassword);
    }
    return true;
  };

  // Each field in a group named by it, so its "Show password" toggle says which
  // field it shows (guidelines 1.3). A shown field stays secret by its
  // autocomplete token (guidelines 4.5).
  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      aria-label={t(labels.changePassword)}
    >
      <div role="group" aria-label={t(labels.currentPassword)}>
        <FormField
          label={t(labels.currentPassword)}
          name="currentPassword"
          rules={{ required: 'Required' }}
        >
          <PasswordField autoComplete="current-password" aria-required />
        </FormField>
      </div>
      <div role="group" aria-label={t(labels.newPassword)}>
        <FormField
          name="newPassword"
          label={t(labels.newPassword)}
          rules={{
            required: 'Required',
            minLength: { value: 8, message: t(messages.minPasswordLength, { n: '8' }) },
          }}
        >
          <PasswordField autoComplete="new-password" aria-required />
        </FormField>
      </div>
      <div role="group" aria-label={t(labels.confirmPassword)}>
        <FormField
          name="confirmPassword"
          label={t(labels.confirmPassword)}
          rules={{
            required: t(labels.required),
            minLength: { value: 8, message: t(messages.minPasswordLength, { n: '8' }) },
            validate: samePassword,
          }}
        >
          <PasswordField autoComplete="new-password" aria-required />
        </FormField>
      </div>
      <FormButtons>
        <Button onPress={onClose}>{t(labels.cancel)}</Button>
        <FormSubmitButton isDisabled={isPending}>{t(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
