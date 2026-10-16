export type Platform = 'X' | 'Instagram' | 'TikTok' | 'Facebook';
export type PostStatus = 'scheduled' | 'published' | 'failed';
export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  mediaUrl?: string;
  scheduledAt: string;
  status: PostStatus;
  errorMessage?: string;
}
export const platforms: Platform[] = ['X', 'Instagram', 'TikTok', 'Facebook'];
export const limits: Record<Platform, number> = { X: 280, Instagram: 2200, TikTok: 2200, Facebook: 5000 };
