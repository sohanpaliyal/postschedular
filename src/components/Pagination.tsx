import {
  cn,
  paginationBtnStyles,
  paginationMetaStyles,
  paginationPageBtnStyles,
  paginationPageLabelStyles,
  paginationSizeSelectStyles,
  paginationStyles,
} from '@/ui';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
export interface PaginationProps {
  /** Total number of items across all pages. */
  total: number;
  /** Current page index (1-based). */
  page: number;
  /** Number of items shown per page. */
  pageSize: number;
  /** Called when the user navigates to a different page. */
  onPageChange: (page: number) => void;
  /** Called when the user picks a different page-size. */
  onPageSizeChange: (size: number) => void;
  /** Available page-size choices. Defaults to [5, 10, 20, 50]. */
  pageSizeOptions?: number[];
  className?: string;
}
const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
/** Generates the visible page numbers with ellipsis gaps. */
function buildPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current <= 4) {
    pages.push(2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push('...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push('...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}
export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pages = buildPages(safePage, totalPages);
  const pageSizeSelectOptions = pageSizeOptions.map((n) => ({ value: n, label: String(n) }));
  return (
    <div
      className={cn(
        cn(
          `pagination flex items-center justify-between flex-wrap text-[11px] [color:var(--analytics-muted,_#929b87)] ${className}`,
          paginationStyles,
        ),
      )}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Left side: page label + rows-per-page */}
      <div className={cn(cn('pagination-meta flex items-center', paginationMetaStyles))}>
        <span
          className={cn(cn('pagination-page-label whitespace-nowrap', paginationPageLabelStyles))}
        >
          Page <strong>{safePage}</strong> of {totalPages}
        </span>
        <span
          className={cn(
            '[display:inline-block] w-[1px] h-[16px] [background:var(--analytics-border,_#e7e9e1)]',
          )}
          aria-hidden="true"
        />
        <span className={cn('whitespace-nowrap')}>Rows per page</span>
        <Select<number>
          label="Rows per page"
          value={pageSize}
          onChange={(v) => {
            onPageSizeChange(v);
            onPageChange(1);
          }}
          options={pageSizeSelectOptions}
          size="sm"
          className={cn(cn('pagination-size-select', paginationSizeSelectStyles))}
        />
      </div>

      {/* Right side: page buttons */}
      <div className={cn('flex items-center gap-[4px] flex-wrap')}>
        <Button
          variant="secondary"
          size="sm"
          shape="rounded"
          aria-label="First page"
          disabled={safePage === 1}
          onClick={() => onPageChange(1)}
          className={cn(cn('pagination-btn', paginationBtnStyles))}
        >
          <ChevronFirst size={14} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          shape="rounded"
          aria-label="Previous page"
          disabled={safePage === 1}
          onClick={() => onPageChange(safePage - 1)}
          className={cn(cn('pagination-btn', paginationBtnStyles))}
        >
          <ChevronLeft size={14} />
        </Button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className={cn(
                'inline-flex items-center justify-center w-[30px] h-[30px] text-[13px] [color:var(--analytics-muted,_#929b87)] [user-select:none]',
              )}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === safePage ? 'primary' : 'secondary'}
              size="sm"
              shape="rounded"
              aria-label={`Page ${p}`}
              aria-current={p === safePage ? 'page' : undefined}
              onClick={() => onPageChange(p as number)}
              className={cn(
                cn(
                  'pagination-btn pagination-page-btn',
                  paginationBtnStyles,
                  paginationPageBtnStyles,
                ),
              )}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="secondary"
          size="sm"
          shape="rounded"
          aria-label="Next page"
          disabled={safePage === totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className={cn(cn('pagination-btn', paginationBtnStyles))}
        >
          <ChevronRight size={14} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          shape="rounded"
          aria-label="Last page"
          disabled={safePage === totalPages}
          onClick={() => onPageChange(totalPages)}
          className={cn(cn('pagination-btn', paginationBtnStyles))}
        >
          <ChevronLast size={14} />
        </Button>
      </div>
    </div>
  );
}
