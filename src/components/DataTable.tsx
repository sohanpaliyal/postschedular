import type { ReactNode } from 'react';
export interface TableColumn<T> { key: string; heading: ReactNode; render: (row: T) => ReactNode; className?: string }
export function DataTable<T>({ caption, columns, rows, rowKey, empty }: { caption: string; columns: TableColumn<T>[]; rows: T[]; rowKey: (row: T) => string; empty: ReactNode }) {
  return <div className="data-table-scroll" role="region" aria-label={caption} tabIndex={0}><table className="data-table"><caption className="sr-only">{caption}</caption><thead><tr>{columns.map(column => <th key={column.key} scope="col" className={column.className}>{column.heading}</th>)}</tr></thead><tbody>{rows.length ? rows.map(row => <tr key={rowKey(row)}>{columns.map(column => <td key={column.key} className={column.className}>{column.render(row)}</td>)}</tr>) : <tr><td colSpan={columns.length}><div className="empty-state">{empty}</div></td></tr>}</tbody></table></div>;
}
