import { isValid, parse } from 'date-fns';
import { useLocale, useMessages } from '@/components/hooks';
import { DATE_FORMATS, formatDate } from '@/lib/date';

const BUCKET_FORMATS = { minute: 'PPp', hour: 'PPp', day: 'PP', month: 'MMM yyyy', year: 'yyyy' };

export interface ChartDataTableProps {
  caption: string;
  /** the chart's series, as it draws them: one per label, a point per time bucket */
  datasets: { label?: string; data: { x: string; y: number | null }[] }[];
  unit: string;
}

/**
 * A time chart's figures as a table, visually hidden: the data equivalent of the
 * drawing (guidelines 3.4). Render it beside the chart, from the same series.
 */
export function ChartDataTable({ caption, datasets, unit }: ChartDataTableProps) {
  const { t, labels } = useMessages();
  const { locale } = useLocale();
  const series = (datasets ?? []).filter(({ label }) => label);
  // a bucket is written in Umami's DATE_FORMATS for its unit ("2026-10-29 13" for an hour)
  const bucketLabel = (x: string) => {
    const date = DATE_FORMATS[unit] ? parse(x, DATE_FORMATS[unit], new Date()) : undefined;
    return date && isValid(date) && BUCKET_FORMATS[unit]
      ? formatDate(date, BUCKET_FORMATS[unit], locale)
      : x;
  };

  if (!series.length) {
    return null;
  }

  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{t(labels.date)}</th>
          {series.map(({ label }) => (
            <th key={label} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {series[0].data.map(({ x }, i) => (
          <tr key={x}>
            <th scope="row">{bucketLabel(x)}</th>
            {series.map(({ label, data }) => (
              <td key={label}>{data[i]?.y ?? 0}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
