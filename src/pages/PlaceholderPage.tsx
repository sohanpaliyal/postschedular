import type { ReactNode } from 'react';
import { appH1Styles, cn } from '@/ui';
export function PlaceholderPage({
  title,
  icon,
  description,
}: {
  title: string;
  icon: ReactNode;
  description: string;
}) {
  return (
    <section
      className={cn(
        'm-[28px_auto_0] [&_h1]:text-[29px] [&_h1]:m-[0_0_24px] [&_h1]:tracking-[-1px] max-[760px]:mt-[22px] max-w-[1280px] pb-[24px] text-foreground',
      )}
    >
      <h1 className={cn(cn('app-h1', appH1Styles))}>{title}</h1>
      <div
        className={cn(
          'route-card border border-outline rounded-[18px] p-[28px] max-[760px]:p-[20px] max-[760px]:rounded-[14px] bg-surface p-[65px_24px] [&_>_span]:inline-grid [&_>_span]:[place-items:center] [&_>_span]:w-[52px] [&_>_span]:h-[52px] [&_>_span]:rounded-[14px] [&_>_span]:bg-soft [&_>_span]:text-accent [&_h2]:text-[20px] [&_h2]:font-medium [&_h2]:m-[20px_0_10px] [&_p]:text-[12px] [&_p]:text-muted [&_p]:leading-[1.8] [&_p]:m-[0_auto] [&_p]:max-w-[420px] [&_small]:block [&_small]:mt-[22px] [&_small]:text-[10px] [&_small]:text-muted max-[760px]:p-[48px_20px] text-center',
        )}
      >
        <span>{icon}</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <small>Page setup complete · Features coming next</small>
      </div>
    </section>
  );
}
