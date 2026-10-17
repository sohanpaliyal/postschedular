import { cn } from '../ui/cn';
import { Check, Clock3, LayoutGrid, RotateCcw, Search } from 'lucide-react';
import type { Ref } from 'react';
import { platforms } from '../types/post';
import { Select } from './Select';
import { PlatformIcon } from './PostIndicators';
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
    <div className={cn('filters flex gap-[7px]')}>
      <label className={cn('search-field flex items-center gap-[8px]')}>
        <Search size={16} />
        <input
          className={cn('app-input')}
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
