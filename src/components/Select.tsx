import {
  appInputStyles,
  cn,
  isOpenStyles,
  richSelectChevronStyles,
  richSelectIconStyles,
  richSelectMenuStyles,
  richSelectOptionStyles,
  richSelectOptionTextStyles,
  richSelectOptionsStyles,
  richSelectSearchStyles,
  richSelectStyles,
  richSelectTriggerStyles,
} from '../ui';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from './Button';
export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}
export interface SelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label: string;
  id?: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  variant?: 'default' | 'ghost';
  className?: string;
  name?: string;
}
/** Controlled single select. The top-layer menu also works inside native dialogs. */
export function Select<T extends string | number>({
  value,
  onChange,
  options,
  label,
  id,
  placeholder = 'Select an option',
  searchable = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
  name,
}: SelectProps<T>) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 200, maxHeight: 280 });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ text: '', time: 0 });
  const selected = options.find((option) => option.value === value);
  const filtered = options.filter(
    (option) =>
      option.label.toLowerCase().includes(query.toLowerCase()) ||
      option.description?.toLowerCase().includes(query.toLowerCase()),
  );
  function close(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  }
  function reveal(last = false) {
    if (disabled) return;
    setQuery('');
    const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
    const enabled = options
      .map((option, index) => (!option.disabled ? index : -1))
      .filter((index) => index >= 0);
    setActive(
      last ? (enabled.at(-1) ?? -1) : selectedIndex >= 0 ? selectedIndex : (enabled[0] ?? -1),
    );
    setOpen(true);
  }
  function choose(option: SelectOption<T>) {
    if (option.disabled) return;
    onChange(option.value);
    close(true);
  }
  useLayoutEffect(() => {
    if (!open) return;
    const node = panel.current;
    node?.showPopover();
    function place() {
      const anchor = trigger.current?.getBoundingClientRect();
      if (!anchor) return;
      const margin = 8;
      const width = Math.min(
        Math.max(anchor.width, searchable ? 210 : 170),
        window.innerWidth - margin * 2,
      );
      const desiredHeight = Math.min(280, filtered.length * 43 + (searchable ? 49 : 0) + 12);
      const below = window.innerHeight - anchor.bottom - margin;
      const above = anchor.top - margin;
      const placeAbove = below < desiredHeight && above > below;
      const maxHeight = Math.max(80, Math.min(280, placeAbove ? above - 6 : below - 6));
      const height = Math.min(desiredHeight, maxHeight);
      setPosition({
        left: Math.max(margin, Math.min(anchor.left, window.innerWidth - width - margin)),
        top: placeAbove ? anchor.top - height - 6 : anchor.bottom + 6,
        width,
        maxHeight,
      });
    }
    place();
    (searchable ? search.current : list.current)?.focus({ preventScroll: true });
    const scroll = (e: Event) => {
      if (!panel.current?.contains(e.target as Node)) place();
    };
    document.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', place);
    return () => {
      node?.hidePopover();
      document.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', place);
    };
  }, [open, searchable, filtered.length]);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  if (disabled && open) setOpen(false);
  useEffect(() => {
    if (open)
      document.getElementById(`${uid}-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, uid]);
  function keyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      close(true);
      return;
    }
    if (e.key === 'Tab') {
      close();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      if (!open) {
        reveal(e.key === 'ArrowUp');
        return;
      }
      const enabled = filtered
        .map((option, index) => (!option.disabled ? index : -1))
        .filter((index) => index >= 0);
      const current = enabled.indexOf(active);
      const next = (current + (e.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
      setActive(enabled[next] ?? -1);
      return;
    }
    if (open && (e.key === 'Home' || e.key === 'End') && e.target !== search.current) {
      e.preventDefault();
      const enabled = filtered
        .map((option, index) => (!option.disabled ? index : -1))
        .filter((index) => index >= 0);
      setActive((e.key === 'Home' ? enabled[0] : enabled.at(-1)) ?? -1);
      return;
    }
    if (e.key === 'Enter' || (e.key === ' ' && e.target !== search.current)) {
      e.preventDefault();
      if (!open) reveal();
      else if (filtered[active]) choose(filtered[active]);
      return;
    }
    if (
      e.key.length === 1 &&
      e.target !== search.current &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      e.preventDefault();
      const now = e.timeStamp;
      typeahead.current.text =
        now - typeahead.current.time > 700 ? e.key : typeahead.current.text + e.key;
      typeahead.current.time = now;
      const match = filtered.findIndex(
        (option) =>
          !option.disabled &&
          option.label.toLowerCase().startsWith(typeahead.current.text.toLowerCase()),
      );
      if (match >= 0) {
        if (!open) reveal();
        setActive(match);
      }
    }
  }
  return (
    <div
      className={cn(
        cn(
          `rich-select relative rich-select--${size} rich-select--${variant} ${className}`,
          richSelectStyles,
        ),
      )}
      ref={root}
      onKeyDown={keyDown}
    >
      {name && (
        <input
          className={cn(cn('app-input', appInputStyles))}
          type="hidden"
          name={name}
          value={value}
          disabled={disabled}
        />
      )}
      <Button
        ref={trigger}
        id={id}
        variant="unstyled"
        className={cn(
          cn(
            `rich-select-trigger flex items-center w-full text-left whitespace-nowrap ${open ? cn('is-open', isOpenStyles) : ''}`,
            richSelectTriggerStyles,
          ),
        )}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => (open ? close() : reveal())}
      >
        {selected?.icon && (
          <span
            className={cn(
              cn(
                'rich-select-icon inline-flex items-center justify-center shrink-[0]',
                richSelectIconStyles,
              ),
            )}
            aria-hidden="true"
          >
            {selected.icon}
          </span>
        )}
        <span className={cn('flex-1 overflow-hidden text-ellipsis')}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            cn('rich-select-chevron shrink-[0] [color:#939b89]', richSelectChevronStyles),
          )}
          aria-hidden="true"
        />
      </Button>
      {open && (
        <div
          ref={panel}
          popover="manual"
          className={cn(
            cn(
              'rich-select-menu fixed [inset:auto] m-[0] p-[5px] overflow-hidden flex-col z-[1000]',
              richSelectMenuStyles,
            ),
          )}
          style={{
            left: position.left,
            top: position.top,
            width: position.width,
            maxHeight: position.maxHeight,
          }}
        >
          {searchable && (
            <label
              className={cn(
                cn(
                  'rich-select-search flex items-center gap-[7px] m-[3px_3px_5px] shrink-[0]',
                  richSelectSearchStyles,
                ),
              )}
            >
              <Search size={14} />
              <input
                className={cn(cn('app-input', appInputStyles))}
                ref={search}
                role="combobox"
                aria-expanded={true}
                aria-autocomplete="list"
                value={query}
                placeholder="Search options…"
                aria-label={`Search ${label.toLowerCase()}`}
                aria-controls={listId}
                aria-activedescendant={active >= 0 ? `${uid}-option-${active}` : undefined}
                onChange={(e) => {
                  setQuery(e.target.value);
                  const first = options
                    .filter(
                      (option) =>
                        option.label.toLowerCase().includes(e.target.value.toLowerCase()) ||
                        option.description?.toLowerCase().includes(e.target.value.toLowerCase()),
                    )
                    .findIndex((option) => !option.disabled);
                  setActive(first);
                }}
              />
            </label>
          )}
          <div
            ref={list}
            id={listId}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            aria-activedescendant={active >= 0 ? `${uid}-option-${active}` : undefined}
            className={cn(
              cn(
                'rich-select-options overflow-auto [overscroll-behavior:contain] min-h-[0] [scrollbar-width:thin] [scrollbar-color:#d5ddca_transparent]',
                richSelectOptionsStyles,
              ),
            )}
          >
            {filtered.map((option, index) => (
              <Button
                variant="unstyled"
                key={option.value}
                id={`${uid}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled || undefined}
                tabIndex={-1}
                className={cn(
                  cn(
                    `rich-select-option flex items-center gap-[9px] min-h-[36px] w-full p-[9px_10px] border-0 rounded-[8px] text-left ${active === index ? 'is-active' : ''} ${option.value === value ? 'is-selected' : ''}`,
                    richSelectOptionStyles,
                  ),
                )}
                onPointerMove={() => {
                  if (!option.disabled) setActive(index);
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(option)}
              >
                {option.icon && (
                  <span
                    className={cn(
                      cn(
                        'rich-select-icon inline-flex items-center justify-center shrink-[0]',
                        richSelectIconStyles,
                      ),
                    )}
                    aria-hidden="true"
                  >
                    {option.icon}
                  </span>
                )}
                <span
                  className={cn(
                    cn(
                      'rich-select-option-text flex flex-1 flex-col gap-[3px]',
                      richSelectOptionTextStyles,
                    ),
                  )}
                >
                  <span>{option.label}</span>
                  {option.description && <small>{option.description}</small>}
                </span>
                {option.value === value && <Check size={14} aria-hidden="true" />}
              </Button>
            ))}
            {filtered.length === 0 && (
              <p
                className={cn('text-center p-[16px_6px] [color:#9aa58c] text-[11px]')}
                role="status"
              >
                No options found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
