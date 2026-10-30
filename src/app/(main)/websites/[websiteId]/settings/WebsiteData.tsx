import { Button, Column, Dialog, DialogTrigger, Modal } from '@umami/react-zen';
import { useId } from 'react';
import { ActionForm } from '@/components/common/ActionForm';
import {
  useLoginQuery,
  useMessages,
  useModified,
  useNavigation,
  useUserTeamsQuery,
} from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { WebsiteDeleteForm } from './WebsiteDeleteForm';
import { WebsiteResetForm } from './WebsiteResetForm';
import { WebsiteTransferForm } from './WebsiteTransferForm';

export function WebsiteData({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const { t, labels, messages } = useMessages();
  const { user } = useLoginQuery();
  const { touch } = useModified();
  const { router, pathname, teamId, renderUrl } = useNavigation();
  const { data: teams } = useUserTeamsQuery(user.id);
  const isAdmin = pathname.startsWith('/admin');
  const transferHintId = useId();
  const resetHintId = useId();
  const deleteHintId = useId();

  const canTransferWebsite =
    (
      (!teamId &&
        teams?.data?.filter(({ members }) =>
          members.find(
            ({ role, userId }) =>
              [ROLES.teamOwner, ROLES.teamManager].includes(role) && userId === user.id,
          ),
        )) ||
      []
    ).length > 0 ||
    (teamId &&
      !!teams?.data
        ?.find(({ id }) => id === teamId)
        ?.members.find(({ role, userId }) => role === ROLES.teamOwner && userId === user.id));

  const handleSave = () => {
    touch('websites');
    onSave?.();
    router.push(renderUrl(`/websites`));
  };

  const handleReset = async () => {
    onSave?.();
  };

  // what each opens and does, in the words shown beside it (guidelines 1.16)
  return (
    <Column gap="6">
      <span id={transferHintId} hidden>
        {t(messages.transferWebsite)}
      </span>
      <span id={resetHintId} hidden>
        {t(messages.resetWebsiteWarning)}
      </span>
      <span id={deleteHintId} hidden>
        {t(messages.deleteWebsiteWarning)}
      </span>
      {!isAdmin && (
        <ActionForm label={t(labels.transferWebsite)} description={t(messages.transferWebsite)}>
          <DialogTrigger>
            <Button
              isDisabled={!canTransferWebsite}
              aria-label={t(labels.transferWebsite)}
              aria-describedby={transferHintId}
              data-agentom-id="website.transfer"
            >
              {t(labels.transfer)}
            </Button>
            <Modal>
              <Dialog title={t(labels.transferWebsite)} style={{ width: 400 }}>
                {({ close }) => (
                  <WebsiteTransferForm websiteId={websiteId} onSave={handleSave} onClose={close} />
                )}
              </Dialog>
            </Modal>
          </DialogTrigger>
        </ActionForm>
      )}

      <ActionForm label={t(labels.resetWebsite)} description={t(messages.resetWebsiteWarning)}>
        <DialogTrigger>
          <Button
            aria-label={t(labels.resetWebsite)}
            aria-describedby={resetHintId}
            data-agentom-id="website.reset"
          >
            {t(labels.reset)}
          </Button>
          <Modal>
            <Dialog title={t(labels.resetWebsite)} style={{ width: 400 }}>
              {({ close }) => (
                <WebsiteResetForm websiteId={websiteId} onSave={handleReset} onClose={close} />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </ActionForm>

      <ActionForm label={t(labels.deleteWebsite)} description={t(messages.deleteWebsiteWarning)}>
        <DialogTrigger>
          <Button
            data-test="button-delete"
            variant="danger"
            aria-label={t(labels.deleteWebsite)}
            aria-describedby={deleteHintId}
            data-agentom-id="website.delete"
          >
            {t(labels.delete)}
          </Button>
          <Modal>
            <Dialog title={t(labels.deleteWebsite)} style={{ width: 400 }}>
              {({ close }) => (
                <WebsiteDeleteForm websiteId={websiteId} onSave={handleSave} onClose={close} />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </ActionForm>
    </Column>
  );
}
