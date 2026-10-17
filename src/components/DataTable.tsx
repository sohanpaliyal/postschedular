import { cn, dataTableScrollStyles, dataTableStyles, emptyStateStyles } from '@/ui';
import type { ReactNode } from 'react';
export interface TableColumn<T> {
  key: string;
  heading: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
}
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  empty,
}: {
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty: ReactNode;
}) {
  return (
    <div
      className={cn(
        cn(
          'data-table-scroll overflow-auto [scrollbar-width:thin] [scrollbar-color:#b3c39d_transparent]',
          dataTableScrollStyles,
        ),
      )}
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className={cn(cn('data-table text-foreground text-left', dataTableStyles))}>
        <caption
          className={cn(
            'absolute w-[1px] h-[1px] p-[0] m-[-1px] overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap border-0',
          )}
        >
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cn(column.className)}>
                {column.heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={cn(column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <div className={cn(cn('empty-state text-center p-[42px_20px]', emptyStateStyles))}>
                  {empty}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
