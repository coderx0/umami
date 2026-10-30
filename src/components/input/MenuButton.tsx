import { Button, DialogTrigger, Icon, Menu, Popover } from '@umami/react-zen';
import {
  Children,
  cloneElement,
  isValidElement,
  type Key,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react';
import { Ellipsis } from '@/components/icons';

export function MenuButton({
  children,
  onAction,
  isDisabled,
  label,
  description,
  id,
}: {
  children: ReactNode;
  onAction?: (action: string) => void;
  isDisabled?: boolean;
  /** the button's name: which row's actions it opens */
  label?: string;
  /** what the menu offers, named before it opens (guidelines 1.16) */
  description?: string;
  /** its data-agentom-id */
  id?: string;
}) {
  const descriptionId = useId();
  const handleAction = (key: Key) => {
    onAction?.(key.toString());
  };

  return (
    <>
      {description && (
        <span id={descriptionId} hidden>
          {description}
        </span>
      )}
      <DialogTrigger>
        <Button
          variant="quiet"
          isDisabled={isDisabled}
          aria-label={label}
          aria-describedby={description ? descriptionId : undefined}
          aria-haspopup="menu"
          data-agentom-id={id}
        >
          <Icon>
            <Ellipsis />
          </Icon>
        </Button>
        <Popover side="bottom" align="start">
          <Menu aria-label={label ?? 'menu'} style={{ minWidth: '140px' }}>
            {Children.map(children, child => {
              if (!isValidElement(child)) {
                return child;
              }

              const menuChild = child as ReactElement<{ onAction?: (key: Key) => void }>;

              return cloneElement(menuChild, {
                onAction: (key: Key) => {
                  menuChild.props.onAction?.(key);
                  handleAction(key);
                },
              });
            })}
          </Menu>
        </Popover>
      </DialogTrigger>
    </>
  );
}
