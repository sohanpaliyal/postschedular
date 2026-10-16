import { CalendarDays, Clock3, MoreHorizontal, RotateCcw } from 'lucide-react';
import type { Post } from '../types/post';
import { dayLabel, groupPostsByDay } from '../lib/calendar';
import { Button } from './Button';
import { PlatformIcon, StatusBadge } from './PostIndicators';
export interface PostListProps {
  posts: Post[];
  pending: string[];
  onSelect: (post: Post) => void;
  onRetry: (post: Post) => void;
  onClear?: () => void;
}
export function PostCard({ post, pending, onSelect, onRetry }: { post: Post; pending: boolean; onSelect: (post: Post) => void; onRetry: (post: Post) => void }) {
  return <article className="post-card"><div className="post-top"><div className="platforms">{post.platforms.map(platform => <PlatformIcon key={platform} platform={platform}/>)}</div><StatusBadge status={post.status} pending={pending}/></div><Button variant="unstyled" className="post-content" onClick={() => onSelect(post)}>{post.content}</Button>{post.mediaUrl && <img className="post-image" src={post.mediaUrl} alt="Post attachment" loading="lazy"/>}{post.errorMessage && <p className="post-error">{post.errorMessage}</p>}<div className="post-bottom"><span><Clock3 size={14}/>{new Date(post.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>{post.status === 'failed' ? <Button variant="text" size="sm" disabled={pending} onClick={() => onRetry(post)} startIcon={<RotateCcw size={14}/>}>Retry</Button> : <Button variant="icon" size="sm" aria-label="View post details" onClick={() => onSelect(post)}><MoreHorizontal size={19}/></Button>}</div></article>;
}
export function PostList({ posts, pending, onSelect, onRetry, onClear }: PostListProps) {
  if (!posts.length) return <div className="empty-state"><CalendarDays size={30}/><h3>No posts found</h3><p>Try a different search or make room for something new.</p>{onClear && <Button variant="secondary" onClick={onClear}>Clear filters</Button>}</div>;
  return <>{Array.from(groupPostsByDay(posts), ([day, entries]) => <section className="day-group" key={day}><div className="day-heading"><h3>{dayLabel(day)}</h3><span>{entries.length} posts</span><div/></div><div className="post-grid">{entries.map(post => <PostCard key={post.id} post={post} pending={pending.includes(post.id)} onSelect={onSelect} onRetry={onRetry}/>)}</div></section>)}</>;
}
