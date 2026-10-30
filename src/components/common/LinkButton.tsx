import { Button, type ButtonProps } from '@umami/react-zen';
import type { ReactNode } from 'react';
import Link from '@/components/common/Link';
import { useLocale } from '@/components/hooks';

export interface LinkButtonProps extends ButtonProps {
  href: string;
  target?: string;
  scroll?: boolean;
  variant?: any;
  prefetch?: boolean;
  asAnchor?: boolean;
  children?: ReactNode;
}

export function LinkButton({
  href,
  variant,
  scroll = true,
  target,
  prefetch,
  children,
  asAnchor,
  ...props
}: LinkButtonProps) {
  const { dir } = useLocale();

  const linkElement = asAnchor ? (
    <a href={href} target={target}>
      {children}
    </a>
  ) : (
    <Link href={href} dir={dir} scroll={scroll} target={target} prefetch={prefetch}>
      {children}
    </Link>
  );

  // It navigates, so it's a link with its address (guidelines 1.11), styled as a button:
  // Base UI gives a non-native button role="button", which would hide that.
  return (
    <Button {...props} variant={variant} nativeButton={false} render={linkElement} role="link" />
  );
}
