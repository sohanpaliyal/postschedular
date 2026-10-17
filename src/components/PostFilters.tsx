import type { Ref } from 'react';
import { Check, Clock3, LayoutGrid, RotateCcw, Search } from 'lucide-react';
import { PlatformIcon } from './PostIndicators';
import { Select } from './Select';
import { platforms } from '../types';
import { appInputStyles, cn, filtersStyles, searchFieldStyles } from '../ui';
export interface PostFiltersProps {
  query: string;
  platform: string;
  status: string;
  onQuery: (value: string) => void;
  onPlatform: (value: string) => void;
  onStatus: (value: string) => void;
  searchRef?: Ref<HTMLInputElement>;
}
export function PostFilters({
  query,
  platform,
  status,
  onQuery,
  onPlatform,
  onStatus,
  searchRef,
}: PostFiltersProps) {
  return (
    <div className={cn(cn('filters flex gap-[7px]', filtersStyles))}>
      <label className={cn(cn('search-field flex items-center gap-[8px]', searchFieldStyles))}>
        <Search size={16} />
        <input
          className={cn(cn('app-input', appInputStyles))}
          ref={searchRef}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search content…"
          aria-label="Search content"
        />
      </label>
      <Select
        label="Filter platform"
        value={platform}
        onChange={onPlatform}
        options={[
          { value: 'all', label: 'All platforms', icon: <LayoutGrid size={14} /> },
          ...platforms.map((value) => ({
            value,
            label: value,
            icon: <PlatformIcon platform={value} />,
          })),
        ]}
      />
      <Select
        label="Filter status"
        value={status}
        onChange={onStatus}
        options={[
          { value: 'all', label: 'All statuses' },
          {
            value: 'scheduled',
            label: 'Scheduled',
            description: 'Ready in your queue',
            icon: <Clock3 size={14} />,
          },
          {
            value: 'published',
            label: 'Published',
            description: 'Already shared',
            icon: <Check size={14} />,
          },
          {
            value: 'failed',
            label: 'Failed',
            description: 'Needs your attention',
            icon: <RotateCcw size={14} />,
          },
        ]}
      />
    </div>
  );
}
