import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useWebsiteSegmentsQuery } from '@/components/hooks';
import { SegmentAddButton } from './SegmentAddButton';
import { SegmentsTable } from './SegmentsTable';

export function SegmentsDataTable({ websiteId }: { websiteId?: string }) {
  const { t, messages } = useMessages();
  const query = useWebsiteSegmentsQuery(websiteId, { type: 'segment' });

  const renderActions = () => {
    return <SegmentAddButton websiteId={websiteId} />;
  };

  return (
    <DataGrid
      query={query}
      allowSearch={true}
      searchDescription={t(messages.segmentsSearchRule)}
      autoFocus={false}
      allowPaging={true}
      renderActions={renderActions}
    >
      {({ data }) => <SegmentsTable data={data} />}
    </DataGrid>
  );
}
