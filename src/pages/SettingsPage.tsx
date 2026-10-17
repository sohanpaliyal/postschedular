import { useState } from 'react';
import { Avatar, Button, Modal, PlatformIcon, Select } from '../components';
import { updatePreferences, usePreferences, type Preferences } from '../state';
import { platforms } from '../types';
import { appH1Styles, appInputStyles, cn } from '../ui';
const sectionClasses =
  'route-card border border-outline rounded-[18px] p-[28px] max-[760px]:p-[20px] max-[760px]:rounded-[14px] bg-surface [&_p]:text-muted [&_p]:text-[12px] [&_p]:leading-[1.8] [grid-template-columns:1fr_1.2fr] gap-[40px] mb-[18px] [&_h2]:m-[0_0_8px] [&_h2]:text-[17px] [&_h2]:font-medium [&_p]:m-0 [&_p]:max-w-[340px] max-[760px]:[grid-template-columns:1fr] max-[760px]:gap-[22px] grid';
const controlClasses =
  'min-w-0 [&_>_label]:text-[12px] [&_>_label]:text-foreground [&_legend]:text-[12px] [&_legend]:text-foreground [&_input]:min-w-0 [&_input]:border [&_input]:border-outline [&_input]:bg-card [&_input]:text-foreground [&_input]:rounded-[10px] [&_input]:p-[9px_12px] [&_input]:[font:inherit] [&_input]:text-[13px] [&_fieldset]:border-0 [&_fieldset]:p-0 [&_fieldset]:m-[0_0_6px] [&_legend]:mb-[12px] [&_.rich-select]:w-full flex flex-col items-start gap-[12px]';
export function SettingsPage({ onReset }: { onReset: () => void }) {
  const preferences = usePreferences();
  const [name, setName] = useState(preferences.name);
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState('');
  function save(update: Partial<Preferences>) {
    updatePreferences(update);
    setMessage('Preferences saved.');
  }
  return (
    <section
      className={cn(
        'm-[28px_auto_0] [&_h1]:text-[29px] [&_h1]:m-[0_0_24px] [&_h1]:tracking-[-1px] max-[760px]:mt-[22px] max-w-[1280px] pb-[24px] text-foreground [&_h1]:mb-[10px]',
      )}
    >
      <h1 className={cn(cn('app-h1', appH1Styles))}>Settings.</h1>
      <p className={cn('text-muted text-[12px] leading-[1.8]')}>
        Make this workspace feel like yours. Preferences are saved on this device.
      </p>
      <div role="status" className={cn('text-accent text-[12px] min-h-[28px] mt-[16px]')}>
        {message}
      </div>
      <section className={cn(sectionClasses)}>
        <div>
          <h2>Profile</h2>
          <p>Your name and avatar appear throughout your workspace.</p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) save({ name: name.trim() });
          }}
          className={cn(controlClasses)}
        >
          <label htmlFor="settings-name">Display name</label>
          <div className={cn('[&_input]:flex-1 max-[760px]:flex-wrap flex gap-[10px] w-full')}>
            <input
              className={cn(cn('app-input', appInputStyles))}
              id="settings-name"
              required
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button type="submit" disabled={!name.trim()}>
              Save name
            </Button>
          </div>
          <fieldset>
            <legend>Choose an avatar</legend>
            <div className={cn('flex flex-wrap gap-[10px]')}>
              {['60', '12', '47', '49'].map((id) => (
                <Button
                  key={id}
                  variant="unstyled"
                  className={cn(
                    `rounded-full border-2 border-solid p-[4px] ${preferences.avatarId === id ? 'border-accent' : 'border-transparent'}`,
                  )}
                  aria-label={`Choose avatar ${id}`}
                  aria-pressed={preferences.avatarId === id}
                  onClick={() => save({ avatarId: id })}
                >
                  <Avatar id={id} name="" />
                </Button>
              ))}
            </div>
          </fieldset>
        </form>
      </section>
      <section className={cn(sectionClasses)}>
        <div>
          <h2>Appearance</h2>
          <p>Choose a theme or follow your device’s appearance.</p>
        </div>
        <div className={cn(controlClasses)}>
          <Select
            label="Theme"
            value={preferences.theme}
            onChange={(theme) => save({ theme })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
        </div>
      </section>
      <section className={cn(sectionClasses)}>
        <div>
          <h2>Date & time</h2>
          <p>Schedules use your device’s local timezone and are stored in UTC.</p>
        </div>
        <div className={cn(controlClasses)}>
          <p className={cn('text-[12px] text-foreground m-0')}>Detected timezone</p>
          <p className={cn('settings-timezone')}>
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <Select
            label="Time format"
            value={preferences.timeFormat}
            onChange={(timeFormat) => save({ timeFormat })}
            options={[
              { value: '12', label: '12-hour · 2:30 PM' },
              { value: '24', label: '24-hour · 14:30' },
            ]}
          />
        </div>
      </section>
      <section className={cn(sectionClasses)}>
        <div>
          <h2>Scheduling defaults</h2>
          <p>Start new posts with your preferred channels and next available posting time.</p>
        </div>
        <div className={cn(controlClasses)}>
          <fieldset>
            <legend>Default platforms</legend>
            <div
              className={cn(
                'flex flex-wrap items-center gap-[10px] [&_.button]:inline-flex [&_.button]:h-[36px] [&_.button]:items-center [&_.button]:gap-[8px] [&_.button]:text-[12px]',
              )}
            >
              {platforms.map((platform) => (
                <Button
                  key={platform}
                  variant={preferences.defaultPlatforms.includes(platform) ? 'soft' : 'outline'}
                  aria-pressed={preferences.defaultPlatforms.includes(platform)}
                  startIcon={<PlatformIcon platform={platform} size="md" decorative />}
                  disabled={
                    preferences.defaultPlatforms.length === 1 &&
                    preferences.defaultPlatforms.includes(platform)
                  }
                  onClick={() =>
                    save({
                      defaultPlatforms: preferences.defaultPlatforms.includes(platform)
                        ? preferences.defaultPlatforms.filter((p) => p !== platform)
                        : [...preferences.defaultPlatforms, platform],
                    })
                  }
                >
                  {platform}
                </Button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="settings-posting-time">Preferred posting time</label>
          <input
            className={cn(cn('app-input', appInputStyles))}
            id="settings-posting-time"
            type="time"
            required
            value={preferences.postingTime}
            onChange={(event) => {
              if (event.target.value) save({ postingTime: event.target.value });
            }}
          />
        </div>
      </section>
      <section className={cn(sectionClasses)}>
        <div>
          <h2>Demo data</h2>
          <p>
            Restore the 32 sample posts and default demo account connections. Your preferences stay
            saved.
          </p>
        </div>
        <div className={cn(controlClasses)}>
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            Reset demo data
          </Button>
        </div>
      </section>
      {confirmReset && (
        <Modal title="Reset demo data?" onClose={() => setConfirmReset(false)}>
          <p className={cn('leading-[1.8] text-[14px]')}>
            This replaces your local posts, including posts you created, with fresh sample posts.
            Instagram will be connected; Facebook, X and TikTok will be disconnected.
          </p>
          <div className={cn('flex justify-end gap-[10px] mt-[24px]')}>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onReset();
                setConfirmReset(false);
                setMessage('Demo posts and account connections reset.');
              }}
            >
              Reset demo data
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
