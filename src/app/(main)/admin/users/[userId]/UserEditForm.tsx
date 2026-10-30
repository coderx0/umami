import {
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  ListItem,
  PasswordField,
  Select,
  TextField,
} from '@umami/react-zen';
import { useId } from 'react';
import { useLoginQuery, useMessages, useUpdateQuery, useUser } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function UserEditForm({ userId, onSave }: { userId: string; onSave?: () => void }) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const user = useUser();
  const { user: login } = useLoginQuery();
  const roleChoicesId = useId();
  const passwordHintId = useId();

  const { mutateAsync, error, toast, touch } = useUpdateQuery(`/users/${userId}`);

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(t(messages.saved));
        touch('users');
        touch(`user:${user.id}`);
        onSave?.();
      },
    });
  };

  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      values={user}
      aria-label={t(labels.user)}
    >
      <span id={roleChoicesId} hidden>
        {`${t(labels.choices)}: ${t(labels.viewOnly)}, ${t(labels.user)}, ${t(labels.admin)}`}
      </span>
      <span id={passwordHintId} hidden>
        {t(messages.passwordKeepHint)}
      </span>
      <FormField name="username" label={t(labels.username)}>
        <TextField data-test="input-username" />
      </FormField>
      <FormField
        name="password"
        label={t(labels.password)}
        rules={{
          minLength: { value: 8, message: t(messages.minPasswordLength, { n: '8' }) },
        }}
      >
        <PasswordField
          autoComplete="new-password"
          data-test="input-password"
          aria-describedby={passwordHintId}
        />
      </FormField>

      {user.id !== login.id && (
        <FormField name="role" label={t(labels.role)} rules={{ required: t(labels.required) }}>
          <Select defaultValue={user.role} buttonProps={{ 'aria-describedby': roleChoicesId }}>
            <ListItem id={ROLES.viewOnly} data-test="dropdown-item-viewOnly">
              {t(labels.viewOnly)}
            </ListItem>
            <ListItem id={ROLES.user} data-test="dropdown-item-user">
              {t(labels.user)}
            </ListItem>
            <ListItem id={ROLES.admin} data-test="dropdown-item-admin">
              {t(labels.admin)}
            </ListItem>
          </Select>
        </FormField>
      )}
      <FormButtons>
        {/* it can change another user's password and role (guidelines 4.3) */}
        <FormSubmitButton
          data-test="button-submit"
          variant="primary"
          data-agentom-id="user.save"
          data-agentom-risk="sensitive"
        >
          {t(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
