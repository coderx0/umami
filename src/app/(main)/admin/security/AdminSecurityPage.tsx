'use client';
import { useQueryClient } from '@tanstack/react-query';
import { Column, Row, Switch, Text } from '@umami/react-zen';
import { useId } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useTwoFactorStatusQuery, useUpdateQuery } from '@/components/hooks';

export function AdminSecurityPage() {
  const { t, labels, messages } = useMessages();
  const descriptionId = useId();
  const { data: status, isLoading } = useTwoFactorStatusQuery(true);
  const { mutateAsync: setGlobal } = useUpdateQuery('/admin/2fa/global');
  const queryClient = useQueryClient();

  const isConfigured = status?.isConfigured;
  const isGlobalRequired = status?.globalRequired ?? false;
  const showConfigurationError = isConfigured === false;

  const handleToggle = async (value: boolean) => {
    await setGlobal({ required: value });
    queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
  };

  if (isLoading) return null;

  return (
    <Column gap="6" margin="2">
      <PageHeader title={t(labels.security)} />
      <Panel>
        <Column gap="4">
          <Column gap="1">
            <Text weight="bold">{t(labels.twoFactorAuth)}</Text>
            <Text id={descriptionId}>
              {showConfigurationError
                ? t(messages.twoFactorErrorNotConfigured)
                : t(messages.twoFactorAdminGlobalDescription)}
            </Text>
          </Column>

          <Row alignItems="center" gap="3">
            <Switch
              isSelected={isGlobalRequired}
              isDisabled={!isConfigured && !isGlobalRequired}
              onChange={handleToggle}
              aria-label={t(labels.twoFactorRequireGlobal)}
              aria-describedby={descriptionId}
              data-agentom-id="security.require-two-factor"
              data-agentom-risk="sensitive"
            />
            <Text>{t(labels.twoFactorRequireGlobal)}</Text>
          </Row>

          {isConfigured === true && isGlobalRequired && (
            <Text size="sm" color="muted">
              {t(messages.twoFactorOverrideNote)}
            </Text>
          )}
        </Column>
      </Panel>
    </Column>
  );
}
