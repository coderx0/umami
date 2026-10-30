import { Icon, Row, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { CopyButton } from '@/components/common/CopyButton';
import { useConfig, useMessages, useMobile } from '@/components/hooks';
import { ExternalLink } from '@/components/icons';

const desktopGridTemplateColumns = 'minmax(180px, 1fr) minmax(0, 2fr) auto';
const rowBorder = '1px solid var(--zen-border)';

export interface ShareRow {
  id: string;
  name: string;
  slug: string;
}

export function SharedSharesTable({
  data = [],
  renderActions,
}: {
  data?: ShareRow[];
  renderActions: (row: ShareRow) => ReactNode;
}) {
  const { t, labels } = useMessages();
  const { cloudMode } = useConfig();
  const { isMobile } = useMobile();

  const getUrl = (slug: string) => {
    if (cloudMode) {
      return `${process.env.cloudUrl}/share/${slug}`;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return `${origin}${process.env.basePath || ''}/share/${slug}`;
  };

  // A table to whatever reads it (guidelines 1.2, 1.7): rows named by the share's
  // name, so each row's buttons say which share they act on. On a phone it's
  // a plain list of cards.
  return (
    <div
      style={{ width: '100%' }}
      role={isMobile ? undefined : 'table'}
      aria-label={isMobile ? undefined : t(labels.shareUrl)}
    >
      {!isMobile && (
        <div
          role="row"
          style={{
            display: 'grid',
            gridTemplateColumns: desktopGridTemplateColumns,
            gap: '16px',
            alignItems: 'center',
            padding: '0 0 12px',
            borderBottom: rowBorder,
          }}
        >
          <Text weight="bold" role="columnheader">
            {t(labels.name)}
          </Text>
          <Text weight="bold" role="columnheader">
            {t(labels.shareUrl)}
          </Text>
          <div role="columnheader">
            <span className="sr-only">{t(labels.actions)}</span>
          </div>
        </div>
      )}
      <div>
        {data.map(row => {
          const url = getUrl(row.slug);

          if (isMobile) {
            return (
              <div
                key={row.id}
                style={{
                  padding: '12px 0',
                  borderBottom: rowBorder,
                }}
              >
                <Text weight="bold">{row.name}</Text>
                <div style={{ marginTop: '8px' }}>
                  <ShareUrlCell url={url} value={row.slug} />
                </div>
                <Row justifyContent="flex-end" style={{ marginTop: '12px' }}>
                  {renderActions(row)}
                </Row>
              </div>
            );
          }

          return (
            <div
              key={row.id}
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: desktopGridTemplateColumns,
                gap: '16px',
                alignItems: 'center',
                minHeight: '56px',
                padding: '12px 0',
                borderBottom: rowBorder,
              }}
            >
              <Text role="rowheader">{row.name}</Text>
              <div role="cell" style={{ minWidth: 0 }}>
                <ShareUrlCell url={url} value={url} />
              </div>
              <Row justifyContent="flex-end" role="cell">
                {renderActions(row)}
              </Row>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShareUrlCell({ url, value }: { url: string; value: string }) {
  return (
    <Row alignItems="center" gap="1" minWidth="0" width="100%" overflow="hidden">
      <Row alignItems="center" gap minWidth="0" style={{ flex: 1 }}>
        <Text title={url} style={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-edge underline-offset-4 hover:text-foreground-primary hover:decoration-primary"
          >
            {value}
          </a>
        </Text>
        <Icon size="sm" strokeColor="muted" style={{ flexShrink: 0 }}>
          <ExternalLink />
        </Icon>
      </Row>
      <CopyButton value={url} label="Copy URL" />
    </Row>
  );
}
