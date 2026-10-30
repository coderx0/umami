import type { UseQueryResult } from '@tanstack/react-query';
import {
  Button,
  Column,
  Icon,
  Row,
  SearchField,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { LayoutGrid, Table2 } from 'lucide-react';
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Pager } from '@/components/common/Pager';
import { useMessages, useMobile, useNavigation } from '@/components/hooks';
import { getItem, setItem } from '@/lib/storage';
import type { PageResult } from '@/lib/types';

const DEFAULT_SEARCH_DELAY = 600;
const DISPLAY_MODE_STORAGE_KEY = 'umami.datagrid.displayMode';

type DisplayMode = 'table' | 'cards';

export interface DataGridProps {
  query: UseQueryResult<PageResult<any>, any>;
  searchDelay?: number;
  allowSearch?: boolean;
  /** what the search matches and how (guidelines 1.15), written from the query that does the matching */
  searchDescription?: string;
  allowPaging?: boolean;
  autoFocus?: boolean;
  renderActions?: () => ReactNode;
  renderEmpty?: () => ReactNode;
  children: ReactNode | ((data: any) => ReactNode);
}

export function DataGrid({
  query,
  searchDelay = 600,
  allowSearch,
  searchDescription,
  allowPaging = true,
  autoFocus,
  renderActions,
  renderEmpty = () => <Empty />,
  children,
}: DataGridProps) {
  const { t, labels, messages } = useMessages();
  const searchHintId = useId();
  const statusId = useId();
  const { data, error, isLoading, isFetching } = query;
  const { router, updateParams, query: queryParams } = useNavigation();
  const [search, setSearch] = useState(queryParams?.search || data?.search || '');
  const showPager = allowPaging && data && data.count > 0;
  const { isMobile } = useMobile();
  const [userDisplayMode, setUserDisplayMode] = useState<DisplayMode | null>(() => {
    const stored = getItem(DISPLAY_MODE_STORAGE_KEY);
    return stored === 'table' || stored === 'cards' ? stored : null;
  });

  const displayMode: DisplayMode | undefined = isMobile ? 'cards' : (userDisplayMode ?? undefined);

  const handleToggleDisplayMode = () => {
    const next: DisplayMode = displayMode === 'cards' ? 'table' : 'cards';
    setItem(DISPLAY_MODE_STORAGE_KEY, next);
    setUserDisplayMode(next);
  };

  const handleSearch = (value: string) => {
    if (value !== search) {
      setSearch(value);
    }
  };

  const handlePageChange = useCallback(
    (page: number) => {
      router.push(updateParams({ search, page }));
    },
    [router, updateParams, search],
  );

  useEffect(() => {
    setSearch(queryParams?.search || '');
  }, [queryParams?.search]);

  useEffect(() => {
    const currentSearch = queryParams?.search || '';

    if (search === currentSearch) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.push(updateParams({ search: search || undefined, page: 1 }));
    }, searchDelay || DEFAULT_SEARCH_DELAY);

    return () => window.clearTimeout(timer);
  }, [queryParams?.search, router, search, searchDelay, updateParams]);

  const child = data ? (typeof children === 'function' ? children(data) : children) : null;

  // From the first keystroke until its rows arrive, the list is updating; then the
  // status line says which slice is shown, and what narrows it (guidelines 1.14).
  const isPending = search !== (queryParams?.search || '') || isFetching;
  const shownSearch = queryParams?.search || '';
  const status = isPending
    ? t(labels.updating)
    : data?.count > 0
      ? [
          t(messages.listStatus, {
            start: ((+data.page - 1) * +data.pageSize + 1).toLocaleString(),
            end: ((+data.page - 1) * +data.pageSize + data.data.length).toLocaleString(),
            count: data.isCapped ? '10,000+' : (+data.count).toLocaleString(),
          }),
          shownSearch && t(messages.listStatusSearch, { search: shownSearch }),
          +data.count > +data.pageSize &&
            t(labels.pageOf, {
              current: (+data.page).toLocaleString(),
              total: Math.ceil(+data.count / +data.pageSize).toLocaleString(),
            }),
        ]
          .filter(Boolean)
          .join(', ')
      : '';

  const viewToggleButton = (
    <TooltipTrigger delay={0}>
      <Button
        variant="zero"
        onPress={handleToggleDisplayMode}
        aria-label={
          displayMode === 'cards' ? t(labels.switchToTableView) : t(labels.switchToCardView)
        }
        data-agentom-id="list.view-toggle"
      >
        <Icon>{displayMode === 'cards' ? <Table2 /> : <LayoutGrid />}</Icon>
      </Button>
      <Tooltip>
        <Text>
          {displayMode === 'cards' ? t(labels.switchToTableView) : t(labels.switchToCardView)}
        </Text>
      </Tooltip>
    </TooltipTrigger>
  );

  return (
    <Column gap="4" minHeight="300px">
      <Row alignItems="center" wrap="wrap" gap>
        {allowSearch && (
          <SearchField
            value={search}
            onSearch={handleSearch}
            delay={0}
            autoFocus={autoFocus}
            placeholder={t(labels.search)}
            className="w-full max-w-md"
            aria-describedby={searchDescription ? searchHintId : undefined}
          />
        )}
        {allowSearch && searchDescription && (
          <span id={searchHintId} hidden>
            {searchDescription}
          </span>
        )}
        <Row
          alignItems="center"
          gap
          style={
            isMobile ? { width: '100%', justifyContent: 'flex-start' } : { marginLeft: 'auto' }
          }
        >
          {renderActions?.()}
          {!isMobile && viewToggleButton}
        </Row>
      </Row>
      <span role="status" id={statusId} className="sr-only">
        {status}
      </span>
      <LoadingPanel
        data={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        renderEmpty={renderEmpty}
      >
        {data && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              overflowX: 'auto',
            }}
          >
            <Column>
              {isValidElement(child)
                ? cloneElement(child as ReactElement<any>, {
                    displayMode,
                    'aria-describedby': statusId,
                    'aria-busy': isPending || undefined,
                  })
                : child}
            </Column>
          </div>
        )}
      </LoadingPanel>
      {showPager && (
        <Row marginTop="4">
          <Pager
            page={data.page}
            pageSize={data.pageSize}
            count={data.count}
            isCapped={data.isCapped}
            onPageChange={handlePageChange}
          />
        </Row>
      )}
    </Column>
  );
}
