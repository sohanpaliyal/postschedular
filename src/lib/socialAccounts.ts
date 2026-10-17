import { storage } from '@/services';
import type { Platform } from '@/types';

export const demoAccounts = [
  { platform: 'Instagram', handle: '@flintzy.studio', accountType: 'Business account' },
  { platform: 'Facebook', handle: 'Flintzy Studio', accountType: 'Facebook page' },
  { platform: 'X', handle: '@flintzystudio', accountType: 'X account' },
  { platform: 'TikTok', handle: '@flintzy.studio', accountType: 'Business account' },
] satisfies { platform: Platform; handle: string; accountType: string }[];

export function connectionKey(platform: Platform) {
  return `flintzy-demo-${platform.toLowerCase()}-connected`;
}

export function initialConnections(): Record<Platform, boolean> {
  const connections: Record<Platform, boolean> = {
    Instagram: true,
    Facebook: false,
    X: false,
    TikTok: false,
  };
  for (const { platform } of demoAccounts) {
    try {
      const stored = storage.get(connectionKey(platform));
      if (stored === 'true' || stored === 'false') connections[platform] = stored === 'true';
    } catch {
      // Use demo defaults when browser storage is unavailable.
    }
  }
  return connections;
}
