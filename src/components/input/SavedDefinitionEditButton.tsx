import { Button, Icon, Menu, MenuItem, MenuTrigger, Popover, Text } from '@umami/react-zen';
import { type ReactNode, useId, useState } from 'react';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useMessages } from '@/components/hooks';
import { useDeleteQuery } from '@/components/hooks/queries/useDeleteQuery';
import { Edit, MoreHorizontal, Trash } from '@/components/icons';
import { DialogButton } from './DialogButton';

export function SavedDefinitionEditButton({
  id,
  websiteId,
  name,
  type,
  title,
  width,
  height,
  minWidth,
  minHeight,
  children,
  onDelete,
}: {
  id: string;
  websiteId: string;
  name: string;
  type: string;
  title?: ReactNode;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  onDelete?: () => void;
  children: ({ close }: { close: () => void }) => ReactNode;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(
    `/websites/${websiteId}/${type}s/${id}`,
  );
  const choicesId = useId();

  const handleAction = (id: any) => {
    if (id === 'edit') {
      setShowEdit(true);
    } else if (id === 'delete') {
      setShowDelete(true);
    }
  };

  const handleClose = () => {
    setShowEdit(false);
    setShowDelete(false);
  };

  const handleDelete = async () => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch(`websites:${type}s`);
        setShowDelete(false);
        onDelete?.();
      },
    });
  };

  return (
    <>
      {/* what the menu offers, named before it opens (guidelines 1.16) */}
      <span id={choicesId} hidden>
        {`${t(labels.actions)}: ${t(labels.edit)}, ${t(labels.delete)}`}
      </span>
      <MenuTrigger>
        <Button
          variant="quiet"
          aria-label={`${t(labels.actions)}: ${name}`}
          aria-describedby={choicesId}
          data-agentom-id={`${type}.${id}.actions`}
        >
          <Icon>
            <MoreHorizontal />
          </Icon>
        </Button>
        <Popover side="bottom">
          <Menu>
            <MenuItem id="edit" onAction={handleAction}>
              <Icon>
                <Edit />
              </Icon>
              <Text>{t(labels.edit)}</Text>
            </MenuItem>
            <MenuItem id="delete" onAction={handleAction}>
              <Icon>
                <Trash />
              </Icon>
              <Text>{t(labels.delete)}</Text>
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      <DialogButton
        isOpen={showEdit}
        onOpenChange={open => !open && handleClose()}
        title={title}
        width={width}
        height={height}
        minWidth={minWidth}
        minHeight={minHeight}
      >
        {children}
      </DialogButton>
      {/* a confirmation whose button is marked destructive (guidelines 4.1) */}
      <DialogButton
        isOpen={showDelete}
        onOpenChange={open => !open && handleClose()}
        title={t(labels.delete)}
        width="400px"
      >
        {() => (
          <ConfirmationForm
            message={t(messages.confirmDelete, { target: name })}
            isLoading={isPending}
            error={getErrorMessage(error)}
            onConfirm={handleDelete}
            onClose={handleClose}
            buttonLabel={t(labels.delete)}
            buttonVariant="danger"
          />
        )}
      </DialogButton>
    </>
  );
}
