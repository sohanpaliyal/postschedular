import { useState } from 'react';
import { SocialAccountCard } from '../components';
import { connectionKey, demoAccounts, initialConnections } from '../lib';
import { storage } from '../services';
import type { Platform, Post } from '../types';
import { appH1Styles, cn } from '../ui';
export function SocialAccountsPage({ posts }: { posts: Post[] }) {
  const [connections, setConnections] = useState(initialConnections);
  const connectedCount = Object.values(connections).filter(Boolean).length;
  function changeConnection(platform: Platform, nextConnected: boolean) {
    setConnections((current) => ({ ...current, [platform]: nextConnected }));
    try {
      storage.set(connectionKey(platform), String(nextConnected));
    } catch {
      // The demo remains interactive when browser storage is unavailable.
    }
  }
  return (
    <section
      className={cn(
        'm-[28px_auto_0] [&_h1]:text-[29px] [&_h1]:m-[0_0_24px] [&_h1]:tracking-[-1px] max-[760px]:mt-[22px] max-w-[1280px] pb-[24px] text-foreground [&_h1]:mb-[10px]',
      )}
    >
      <h1 className={cn(cn('app-h1', appH1Styles))}>Social accounts.</h1>
      <p className={cn('m-[0_0_36px] text-[13px] leading-[1.7] text-muted')}>
        Your channels, in good company. Manage where your content goes.
      </p>
      <div
        className={cn(
          'mb-[18px] [&_h2]:text-[14px] [&_h2]:font-medium [&_h2]:m-0 [&_>_span]:text-[10px] [&_>_span]:text-muted [&_>_span]:bg-soft [&_>_span]:rounded-[6px] [&_>_span]:p-[5px_8px] flex items-center gap-[12px]',
        )}
      >
        <h2>Your accounts</h2>
        <span>
          {connectedCount} of {demoAccounts.length} connected · Demo accounts
        </span>
      </div>
      <div
        className={cn(
          '[&_.social-account-card]:max-w-[none] grid [grid-template-columns:repeat(auto-fit,_minmax(min(100%,_290px),_1fr))] [align-items:start] gap-[22px]',
        )}
      >
        {demoAccounts.map((account) => {
          const platformPosts = posts.filter((post) => post.platforms.includes(account.platform));
          return (
            <SocialAccountCard
              key={account.platform}
              connected={connections[account.platform]}
              onConnectionChange={(connected) => changeConnection(account.platform, connected)}
              account={{
                ...account,
                name: 'Flintzy Studio',
                initials: 'fs',
                scheduledPosts: platformPosts.filter((post) => post.status === 'scheduled').length,
                publishedPosts: platformPosts.filter((post) => post.status === 'published').length,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
