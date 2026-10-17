import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CalendarDays, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { DateTimePicker } from './DateTimePicker';
import { isFuture } from './dateTime';
import { Modal } from './Modal';
import { PlatformIcon } from './PlatformIcon';
import { isAbort } from '../services';
import { preferredSchedule, usePreferences } from '../state';
import { limits, platforms, type Platform, type Post } from '../types';
import {
  appH1Styles,
  appInputStyles,
  appTextareaStyles,
  cn,
  countersStyles,
  fieldLabelStyles,
  formActionsStyles,
  imagePreviewStyles,
  inputWithIconStyles,
  platformOptionsStyles,
  postErrorStyles,
} from '../ui';
export function Composer({
  initialDate,
  inline = false,
  onClose,
  onSave,
  onCreate,
}: {
  initialDate?: string;
  inline?: boolean;
  onClose: () => void;
  onSave: () => void;
  onCreate: (post: Post, signal: AbortSignal) => Promise<void>;
}) {
  const preferences = usePreferences();
  const [content, setContent] = useState('');
  const [selected, setSelected] = useState<Platform[]>(preferences.defaultPlatforms);
  const [image, setImage] = useState('');
  const [date, setDate] = useState(() => initialDate || preferredSchedule());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  function close() {
    request.current?.abort();
    onClose();
  }
  const count = Array.from(content).length;
  const over = selected.some((p) => count > limits[p]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (request.current) return;
    if (!content.trim() || !selected.length || over) {
      setError('Add your content and choose a platform within its character limit.');
      return;
    }
    // DateTimePicker emits a UTC ISO string; isFuture() validates it is strictly > now.
    if (!isFuture(date)) {
      setError('Scheduled time must be in the future.');
      return;
    }
    if (image && !/^https?:\/\//i.test(image)) {
      setError('Enter an image URL beginning with https:// or http://.');
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setError('');
    setBusy(true);
    try {
      await onCreate(
        {
          id: crypto.randomUUID(),
          content: content.trim(),
          platforms: selected,
          mediaUrl: image || undefined,
          scheduledAt: date,
          status: 'scheduled',
        },
        controller.signal,
      );
      if (!controller.signal.aborted) onSave();
    } catch (error) {
      if (!controller.signal.aborted && !isAbort(error))
        setError(
          error instanceof Error
            ? error.message
            : 'Could not schedule your post. Please try again.',
        );
    } finally {
      if (request.current === controller) request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  const form = (
    <form onSubmit={submit}>
      <div
        className={cn(
          'mb-[10px] [&_.field-label]:m-0 flex items-center justify-between gap-[12px]',
        )}
      >
        <span
          className={cn(cn('field-label block', fieldLabelStyles))}
          id="composer-channels-label"
        >
          Where would you like to share?
        </span>
      </div>
      <div
        className={cn(
          cn(
            'platform-options [&_.composer-select-all]:[flex-shrink:0] [&_.composer-select-all]:text-[12px]',
            platformOptionsStyles,
          ),
        )}
        role="group"
        aria-labelledby="composer-channels-label"
      >
        <Button
          variant="text"
          size="sm"
          className={cn('composer-select-all')}
          onClick={() => setSelected(selected.length === platforms.length ? [] : [...platforms])}
        >
          {selected.length === platforms.length ? 'Unselect all' : 'Select all'}
        </Button>
        {platforms.map((p) => (
          <Button
            variant="unstyled"
            type="button"
            aria-pressed={selected.includes(p)}
            key={p}
            className={cn(selected.includes(p) ? 'chosen' : '')}
            onClick={() =>
              setSelected((s) => (s.includes(p) ? s.filter((v) => v !== p) : [...s, p]))
            }
          >
            <PlatformIcon platform={p} decorative />
            {p}
            {selected.includes(p) && <Check size={13} />}
          </Button>
        ))}
      </div>
      <label className={cn(cn('field-label block', fieldLabelStyles))} htmlFor="content">
        Your post
      </label>
      <textarea
        className={cn(
          cn('app-textarea', appTextareaStyles),
          cn('focus:outline-none focus:shadow-none focus-visible:outline-none'),
        )}
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Good things start with a few words…"
        rows={5}
      />
      <div className={cn(cn('counters flex-wrap', countersStyles))}>
        {selected.map((p) => (
          <span key={p} className={cn(count > limits[p] ? 'over-limit' : '')}>
            <PlatformIcon platform={p} decorative />
            {p}{' '}
            <strong>
              {count.toLocaleString()} / {limits[p].toLocaleString()}
            </strong>
          </span>
        ))}
      </div>
      <label className={cn(cn('field-label block', fieldLabelStyles))} htmlFor="image">
        Image URL <span>optional</span>
      </label>
      <div className={cn(cn('input-with-icon flex items-center pl-[12px]', inputWithIconStyles))}>
        <ImageIcon size={17} />
        <input
          className={cn(cn('app-input', appInputStyles))}
          id="image"
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      {image && /^https?:\/\//.test(image) && (
        <img
          key={image}
          className={cn(cn('image-preview', imagePreviewStyles))}
          src={image}
          alt="Image preview"
          onError={(e) => {
            e.currentTarget.alt = 'Image could not be loaded';
          }}
        />
      )}
      <label className={cn(cn('field-label block', fieldLabelStyles))} htmlFor="date">
        Schedule for
      </label>
      <DateTimePicker id="date" value={date} onChange={setDate} />
      {error && (
        <p
          role="alert"
          className={cn(
            cn('post-error leading-[1.6] rounded-[7px] p-[9px_11px] mb-[2px]', postErrorStyles),
          )}
        >
          {error}
        </p>
      )}
      <div
        className={cn(
          cn('form-actions flex gap-[10px] justify-end mt-[24px] pt-[20px]', formActionsStyles),
        )}
      >
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          loading={busy}
          loadingText="Scheduling…"
          startIcon={<CalendarDays size={16} />}
          disabled={over || !content.trim() || !selected.length || !isFuture(date)}
        >
          Schedule post
        </Button>
      </div>
    </form>
  );
  return inline ? (
    <section
      className={cn(
        'm-[28px_auto_0] [&_h1]:text-[29px] [&_h1]:m-[0_0_24px] [&_h1]:tracking-[-1px] max-[760px]:mt-[22px] max-w-[1280px] pb-[24px] text-foreground composer-page [&_.route-card]:max-w-[650px] [&_.field-label:first-child]:mt-[0]',
      )}
    >
      <h1 className={cn(cn('app-h1', appH1Styles))}>Create post</h1>
      <div
        className={cn(
          'route-card border border-outline rounded-[18px] p-[28px] max-[760px]:p-[20px] max-[760px]:rounded-[14px] bg-surface',
        )}
      >
        {form}
      </div>
    </section>
  ) : (
    <Modal title="Create a post" onClose={close}>
      {form}
    </Modal>
  );
}
