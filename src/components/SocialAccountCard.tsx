import { cn } from '../ui/cn';
import { useId, useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, Link2, Unplug } from 'lucide-react';
import { Button } from './Button';
import { PlatformIcon } from './PlatformIcon';
import type { Platform } from '../types/post';

export interface SocialAccount {
  platform: Platform;
  name: string;
  handle: string;
  initials: string;
  accountType: string;
  scheduledPosts: number;
  publishedPosts: number;
}

export function SocialAccountCard({
  account,
  connected,
  onConnectionChange,
}: {
  account: SocialAccount;
  connected: boolean;
  onConnectionChange: (connected: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  return (
    <article
      className={cn(
        'social-account-card max-w-[390px] w-full overflow-hidden bg-card border border-outline rounded-[22px] [box-shadow:0_8px_28px_rgb(25_35_20_/_3%)] text-foreground',
      )}
      aria-label={
        connected ? `${account.name} on ${account.platform}` : `Connect ${account.platform}`
      }
    >
      <div className={cn('flex items-center justify-between gap-[12px] p-[22px_24px]')}>
        <span className={cn('inline-flex items-center gap-[9px] text-[13px] font-medium')}>
          <PlatformIcon platform={account.platform} decorative />
          {account.platform}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-[5px] bg-soft text-foreground rounded-[20px] p-[5px_9px] text-[10px]',
          )}
        >
          {connected ? <Check size={12} /> : <Unplug size={12} />}
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {connected ? (
        <>
          <div
            className={cn(
              '[&_h2]:m-[0_0_6px] [&_h2]:text-[21px] [&_h2]:tracking-[-0.6px] [&_h2]:font-medium [&_p]:m-[0_0_14px] [&_p]:text-[13px] [&_p]:text-muted text-center p-[10px_24px_28px]',
            )}
          >
            <div
              className={cn(
                '[outline:1px_solid_var(--analytics-border)] grid place-items-center w-[76px] h-[76px] m-[0_auto_16px] [border:5px_solid_var(--analytics-card)] rounded-[24px] bg-soft text-accent text-[26px] font-semibold tracking-[-2px]',
              )}
              aria-hidden="true"
            >
              {account.initials}
            </div>
            <h2>{account.name}</h2>
            <p>{account.handle}</p>
            <span
              className={cn(
                'text-[10px] p-[5px_10px] border border-outline rounded-[7px] text-muted',
              )}
            >
              {account.accountType}
            </span>
          </div>
          <dl
            className={cn(
              'grid m-[0_24px_22px] p-[20px_0] [border-top:1px_solid_var(--analytics-border)] [border-bottom:1px_solid_var(--analytics-border)] [&_>_div]:[padding-left:18px] [&_>_div:first-child]:[padding-left:0] [&_>_div:first-child]:[border-right:1px_solid_var(--analytics-border)] [&_dt]:text-[11px] [&_dt]:text-muted [&_dt]:mb-[8px] [&_dd]:flex [&_dd]:items-center [&_dd]:gap-[12px] [&_dd]:m-0 [&_dd]:text-[25px] [&_dd]:font-medium [&_dd_svg]:text-accent grid-cols-2',
            )}
          >
            <div>
              <dt>Scheduled posts</dt>
              <dd>
                {account.scheduledPosts}
                <ArrowUpRight size={15} />
              </dd>
            </div>
            <div>
              <dt>Published posts</dt>
              <dd>
                {account.publishedPosts}
                <Check size={15} />
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <div
          className={cn(
            '[&_h2]:m-[0_0_6px] [&_h2]:text-[21px] [&_h2]:tracking-[-0.6px] [&_h2]:font-medium [&_p]:m-[0_0_14px] [&_p]:text-[13px] [&_p]:text-muted text-center p-[10px_24px_28px] [&_p]:max-w-[260px] [&_p]:m-[0_auto] [&_p]:leading-[1.7] pt-[28px] pb-[32px]',
          )}
        >
          <div
            className={cn(
              '[outline:1px_solid_var(--analytics-border)] grid place-items-center w-[76px] h-[76px] m-[0_auto_16px] [border:5px_solid_var(--analytics-card)] rounded-[24px] bg-soft text-accent text-[26px] font-semibold tracking-[-2px]',
            )}
            aria-hidden="true"
          >
            <Link2 size={28} />
          </div>
          <h2>Connect {account.platform}</h2>
          <p>Add your demo account to start planning content for this channel.</p>
        </div>
      )}
      <div
        className={cn(
          'flex items-center gap-[12px] [&_>_span]:inline-flex [&_>_span]:items-center [&_>_span]:gap-[6px] [&_>_span]:text-muted [&_>_span]:text-[11px] [&_.button]:text-[12px] [&_.button_svg]:[transition:transform_240ms_ease] motion-reduce:[&_.button_svg]:transition-none justify-between p-[0_24px_22px]',
        )}
      >
        <span role="status">{connected ? 'Demo account connected' : 'Connect to get started'}</span>
        <Button
          variant={connected ? 'outline' : 'primary'}
          startIcon={connected ? <Unplug size={15} /> : <Link2 size={15} />}
          onClick={() => {
            setExpanded(false);
            onConnectionChange(!connected);
          }}
          aria-label={`${connected ? 'Disconnect' : 'Connect'} ${account.platform} demo account`}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
      {connected && (
        <>
          <div
            className={cn(
              '[&_.button]:text-[12px] [&_.button_svg]:[transition:transform_240ms_ease] motion-reduce:[&_.button_svg]:transition-none flex justify-end p-[0_24px_18px]',
            )}
          >
            <Button
              variant="secondary"
              endIcon={<ChevronDown size={15} className={cn(expanded ? 'rotate-180' : '')} />}
              aria-expanded={expanded}
              aria-controls={detailsId}
              onClick={() => setExpanded(!expanded)}
            >
              Details
            </Button>
          </div>
          <div
            id={detailsId}
            hidden={!expanded}
            className={cn(
              '[&_p]:m-[7px_0_0] [&_p]:leading-[1.7] [&_p]:text-muted p-[18px_24px] bg-soft [border-top:1px_solid_var(--analytics-border)] text-[12px]',
            )}
          >
            <strong>Demo account</strong>
            <p>
              This is a mock connection for the workspace preview. Post counts come from your local
              posts; no {account.platform} login or publishing is connected.
            </p>
          </div>
        </>
      )}
    </article>
  );
}
