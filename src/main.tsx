import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, UsersRound, BarChart3, LayoutGrid, Files, Bell, Settings, Upload, ChevronRight, ChevronDown, Plus, X, CalendarDays, Clock3, ArrowUpRight, Image as ImageIcon, Check, RotateCcw, PanelLeft, Command } from 'lucide-react';
import { Button } from './components/Button';
import { PlatformIcon } from './components/PlatformIcon';
import { PostFilters } from './components/PostFilters';
import { PostList } from './components/PostList';
import { AllPostsPage } from './pages/AllPostsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { platforms, limits, type Platform, type Post } from './types/post';
import { toLocalDateTime } from './components/dateTime';
import { Avatar } from './components/Avatar';
import { Modal } from './components/Modal';
import { MotionChevron } from './components/MotionChevron';
import { DateTimePicker } from './components/DateTimePicker';
import { isFuture } from './components/dateTime';
import { ThemeSwitch } from './components/ThemeSwitch';
import './styles.css';
import './theme.css';
import './sidebar-motion.css';

const examples = ['A little behind the scenes. A lot of good things on the way. ✨ Here’s what we’ve been working on.', 'Good ideas deserve to be shared. Meet your new favorite way to make every day a little more creative.', 'Slow mornings, fresh perspectives. What’s inspiring you this week? ☕', 'Something new is coming. And we can’t wait to share it with you. Stay close.'];
function seed(): Post[] { return Array.from({ length: 32 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() + Math.floor(i / 4) - 2); date.setHours(9 + i % 4 * 3, 30, 0, 0); const status = i % 7 === 0 ? 'failed' : i < 8 ? 'published' : 'scheduled'; return { id: `post-${i}`, content: examples[i % examples.length], platforms: [platforms[i % 4], ...(i % 3 === 0 ? [platforms[(i + 1) % 4]] : [])], scheduledAt: date.toISOString(), status, errorMessage: status === 'failed' ? 'The platform could not process this post. Please try again.' : undefined }; }); }
const routes = [{ path: '/', label: 'Dashboard', icon: LayoutGrid }, { path: '/posts', label: 'All posts', icon: CalendarDays }, { path: '/compose', label: 'Create post', icon: Plus }, { path: '/analytics', label: 'Analytics', icon: BarChart3 }, { path: '/social-accounts', label: 'Social accounts', icon: UsersRound }, { path: '/settings', label: 'Settings', icon: Settings }];
function App() {
 const [collapsed, setCollapsed] = useState(() => localStorage.getItem('flintzy-sidebar') === 'collapsed');
 const [panel, setPanel] = useState<string | null>(null);
 const [profile, setProfile] = useState(false);
 const [mobile, setMobile] = useState(false);
 const [pathname, setPathname] = useState(location.pathname);
 const currentPath = pathname.replace(/\/$/, '') || '/';
 const currentRoute = routes.find(route => route.path === currentPath);
 const allPostsPage = pathname === '/posts' || pathname === '/posts/';
 const analyticsPage = pathname === '/analytics' || pathname === '/analytics/';
 const [composerDate, setComposerDate] = useState('');
 const [composer, setComposer] = useState(false);
 const [detail, setDetail] = useState<Post | null>(null);
 const [posts, setPosts] = useState<Post[]>(() => { try { const stored = localStorage.getItem('flintzy-posts'); return stored ? JSON.parse(stored) : seed(); } catch { return seed(); } });
 const [loading, setLoading] = useState(true);
 const [notice, setNotice] = useState('');
 const [pending, setPending] = useState<string[]>([]);
 const initial = new URLSearchParams(location.search);
 const [query, setQuery] = useState(initial.get('q') || '');
 const [platform, setPlatform] = useState(initial.get('platform') || 'all');
 const [status, setStatus] = useState(initial.get('status') || 'all');
 const searchRef = useRef<HTMLInputElement>(null);
 useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
 useEffect(() => { localStorage.setItem('flintzy-posts', JSON.stringify(posts)); }, [posts]);
 useEffect(() => { localStorage.setItem('flintzy-sidebar', collapsed ? 'collapsed' : 'expanded'); }, [collapsed]);
 useEffect(() => { const params = new URLSearchParams(location.search); params.delete('q'); params.delete('platform'); params.delete('status'); if (query) params.set('q', query); if (platform !== 'all') params.set('platform', platform); if (status !== 'all') params.set('status', status); history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params : ''}`); }, [query, platform, status]);
 useEffect(() => { const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); searchRef.current?.focus(); } if (e.key === 'Escape') { setComposer(false); setDetail(null); setPanel(null); setProfile(false); setMobile(false); } }; document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler); }, []);
 useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(t); }, [notice]);
 const filtered = posts.filter(p => p.content.toLowerCase().includes(query.toLowerCase()) && (platform === 'all' || p.platforms.includes(platform as Platform)) && (status === 'all' || p.status === status)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
 function navigate(path: string) {
  const params = new URLSearchParams(location.search);
  if (path !== '/posts') { params.delete('view'); params.delete('date'); }
  if (path !== '/analytics') { params.delete('tab'); params.delete('period'); }
  history.pushState(null, '', path + (params.size ? '?' + params : ''));
  setPathname(path); setPanel(null); setMobile(false); window.scrollTo({ top: 0 });
 }
 useEffect(() => {
  const back = () => { const params = new URLSearchParams(location.search); setPathname(location.pathname); setQuery(params.get('q') || ''); setPlatform(params.get('platform') || 'all'); setStatus(params.get('status') || 'all'); };
  window.addEventListener('popstate', back); return () => window.removeEventListener('popstate', back);
 }, []);
 function openComposer(day?: Date) {
  if (day) { const date = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9); if (date.getTime() <= Date.now()) date.setTime(Date.now() + 3600000); setComposerDate(toLocalDateTime(date)); }
  else setComposerDate('');
  setComposer(true);
 }
 const filters = { query, platform, status, onQuery: setQuery, onPlatform: setPlatform, onStatus: setStatus, searchRef };
 function clearFilters() { setQuery(''); setPlatform('all'); setStatus('all'); }
 function exportPosts() {
  const cell = (value: string) => '"' + value.replaceAll('"', '""') + '"';
  const rows = [['ID', 'Content', 'Platforms', 'Scheduled at (UTC)', 'Status', 'Error'], ...filtered.map(p => [p.id, p.content, p.platforms.join(', '), p.scheduledAt, p.status, p.errorMessage || ''])];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = 'postflow-posts.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
 }
 async function retry(post: Post) { setPending(p => [...p, post.id]); setPosts(ps => ps.map(p => p.id === post.id ? { ...p, status: 'scheduled', errorMessage: undefined } : p)); await new Promise(r => setTimeout(r, 1000)); if (Math.random() < .2) { setPosts(ps => ps.map(p => p.id === post.id ? { ...post, errorMessage: 'Retry failed. Please try again.' } : p)); setNotice('Retry failed. Your post has been restored.'); } else setNotice('Post added back to the queue.'); setPending(p => p.filter(id => id !== post.id)); }
 return <div className="app-shell">
 {mobile && <Button variant="unstyled" className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobile(false)} />}
 <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobile ? 'mobile-open' : ''}`} aria-label="Main navigation">
  <div className="brand-row"><Button variant="unstyled" className="brand-mark" aria-label="Flintzy home" onClick={() => navigate('/')}><svg viewBox="0 0 32 32" fill="currentColor"><path d="M12 2h9v9h9v9h-9v10h-9v-9H2v-9h10z" /></svg></Button><Button variant="unstyled" className="collapse-button" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}><MotionChevron horizontal flipped={collapsed}/></Button></div>
  <Button variant="unstyled" className="sidebar-search" aria-label="Search posts" onClick={() => { searchRef.current?.focus(); setMobile(false); }}><Search size={18}/><span className="label">Search</span><span className="shortcut label"><kbd><Command size={14}/></kbd><kbd>S</kbd></span></Button>
  <div className="section-heading">MAIN</div>
  <nav>
   {routes.map(route => ({ ...route, selected: currentPath === route.path })).map(({ path, label, icon: Icon, selected }) => <a key={path} href={path} aria-current={selected ? 'page' : undefined} className={`nav-item all-posts-link ${selected ? 'selected' : ''}`} title={collapsed ? label : undefined} onClick={e => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); navigate(path); } }}><Icon size={20}/><span className="label">{label}</span></a>)}
  </nav>
  <div className="sidebar-footer">{profile && <div className="profile-menu"><strong>John Doe</strong><span>Demo workspace</span><Button variant="unstyled" onClick={() => { setCollapsed(c => !c); setProfile(false); }}><PanelLeft size={16}/> Toggle sidebar</Button></div>}<Button variant="unstyled" className="profile-button" aria-expanded={profile} onClick={() => setProfile(p => !p)}><Avatar id="60" name="John Doe"/><span className="profile-name label"><strong>John Doe</strong><small>Designer</small></span><ChevronDown className="label" size={18}/></Button></div>
 </aside>
 <main className="workspace"><header className="topbar"><div className="header-inner"><div className="breadcrumb"><Button variant="icon" className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobile(true)}><PanelLeft size={20}/></Button><span>Workspace</span><ChevronRight size={14}/><strong>{currentRoute?.label || 'Dashboard'}</strong></div><div className="header-actions"><ThemeSwitch/><Button variant="unstyled" className="header-settings" onClick={() => navigate('/settings')}><Settings size={15}/><span>Setting</span></Button><Button variant="unstyled" className="header-notification" aria-label="Notifications" onClick={() => setPanel('Notification')}><Bell size={17}/></Button><Button variant="unstyled" className="header-avatar" aria-label="Open profile" onClick={() => setPanel('Profile')}><Avatar id="12" name="John Doe"/></Button></div></div></header>
 {currentPath === '/compose' ? <Composer inline onClose={() => navigate('/posts')} onSave={post => { setPosts(ps => [...ps, post]); setNotice('Your post is scheduled. Looking good!'); navigate('/posts'); }}/> : currentPath === '/social-accounts' ? <PlaceholderPage title="Social accounts" icon={<UsersRound size={25}/>} description="Manage the social channels you use for scheduling. Mock account management will be added here."/> : currentPath === '/settings' ? <PlaceholderPage title="Settings" icon={<Settings size={25}/>} description="Workspace preferences and scheduling settings will be available here."/> : analyticsPage ? <AnalyticsPage posts={filtered} filters={filters} loading={loading} onOpenPost={setDetail}/> : allPostsPage ? <AllPostsPage posts={filtered} pending={pending} onSelect={setDetail} onRetry={retry} onClear={clearFilters} filters={filters} loading={loading} onCreate={openComposer}/> : <> <section className="welcome-row" aria-label="Workspace welcome"><div><h2><span>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},</span> John!</h2><p>Plan your content and keep your social channels moving.</p></div><div className="welcome-actions"><Button variant="primary" startIcon={<Plus size={18}/>} onClick={() => openComposer()}>Create post</Button><Button variant="secondary" startIcon={<Upload size={18}/>} endIcon={<ChevronDown size={18}/>} onClick={exportPosts}>Export File</Button></div></section>

 <div className="overview"><div><span>Scheduled</span><strong>{posts.filter(p => p.status === 'scheduled').length}<small>Ready when you are <ArrowUpRight size={14}/></small></strong></div><div><span>Published</span><strong>{posts.filter(p => p.status === 'published').length}<small>Out in the world <Check size={14}/></small></strong></div><div><span>Needs attention</span><strong>{posts.filter(p => p.status === 'failed').length}<small>Let’s give it another go <RotateCcw size={13}/></small></strong></div></div>
 <div className="page-content"><div className="queue-toolbar"><div className="queue-title"><h2>All posts</h2><span>{filtered.length}</span></div><PostFilters {...filters}/></div>
 <div className="timezone"><Clock3 size={13}/> All times in {Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ')}</div>
 {loading ? <div className="skeletons" role="status" aria-label="Loading posts">{[1,2,3].map(n => <div key={n}/>)}</div> : <PostList posts={filtered} pending={pending} onSelect={setDetail} onRetry={retry} onClear={clearFilters}/>}
 <footer className="page-footer">A calmer way to stay connected.<span>Flintzy © {new Date().getFullYear()}</span></footer></div></>}</main>
 {notice && <div className="toast" role="status"><Check size={16}/>{notice}<Button variant="unstyled" aria-label="Dismiss" onClick={() => setNotice('')}><X size={15}/></Button></div>}
 {composer && <Composer initialDate={composerDate} onClose={() => setComposer(false)} onSave={post => { setPosts(ps => [...ps, post]); setComposer(false); setNotice('Your post is scheduled. Looking good!'); }}/>} 
 {detail && <Modal title="Post details" onClose={() => setDetail(null)}><span className={`status ${detail.status}`}><i/>{detail.status}</span><p className="detail-content">{detail.content}</p>{detail.mediaUrl && <img className="detail-image" src={detail.mediaUrl} alt="Post attachment"/>}<div className="detail-meta"><span>Platforms</span><div className="detail-platform-list">{detail.platforms.map(platform => <span key={platform}><PlatformIcon platform={platform} decorative/>{platform}</span>)}</div><span>Scheduled for</span><strong>{new Date(detail.scheduledAt).toLocaleString()}</strong><span>Time zone</span><strong>{Intl.DateTimeFormat().resolvedOptions().timeZone}</strong></div>{detail.errorMessage && <p className="post-error">{detail.errorMessage}</p>}{detail.status === 'failed' && <Button variant="primary" onClick={() => { retry(detail); setDetail(null); }}><RotateCcw size={16}/>Retry post</Button>}</Modal>}
 {panel && <Modal title={panel} onClose={() => setPanel(null)}><div className="empty-state"><Files size={32}/><h3>{`${panel} preview`}</h3><p>Your post scheduling tools are available in Dashboard and All posts.</p><Button variant="secondary" onClick={() => navigate('/')}>Back to post queue</Button></div></Modal>}
 </div>;
}
function Composer({ initialDate, inline = false, onClose, onSave }: { initialDate?: string; inline?: boolean; onClose: () => void; onSave: (post: Post) => void }) { const [content, setContent] = useState(''); const [selected, setSelected] = useState<Platform[]>(['X']); const [image, setImage] = useState(''); const [date, setDate] = useState(initialDate || ''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const count = Array.from(content).length; const over = selected.some(p => count > limits[p]); async function submit(e: React.FormEvent) { e.preventDefault(); if (!content.trim() || !selected.length || over) { setError('Add your content and choose a platform within its character limit.'); return; } if (!date || new Date(date).getTime() <= Date.now()) { setError('Choose a date and time in the future.'); return; } if (image && !/^https?:\/\//i.test(image)) { setError('Enter an image URL beginning with https:// or http://.'); return; } setBusy(true); await new Promise(r => setTimeout(r, 500)); onSave({ id: crypto.randomUUID(), content: content.trim(), platforms: selected, mediaUrl: image || undefined, scheduledAt: new Date(date).toISOString(), status: 'scheduled' }); }
const form = <form onSubmit={submit}><label className="field-label">Where would you like to share?</label><div className="platform-options">{platforms.map(p => <Button variant="unstyled" type="button" aria-pressed={selected.includes(p)} key={p} className={selected.includes(p) ? 'chosen' : ''} onClick={() => setSelected(s => s.includes(p) ? s.filter(v => v !== p) : [...s, p])}><PlatformIcon platform={p} decorative/>{p}{selected.includes(p) && <Check size={13}/>}</Button>)}</div><label className="field-label" htmlFor="content">Your post</label><textarea id="content" value={content} onChange={e => setContent(e.target.value)} placeholder="Good things start with a few words…" rows={5}/><div className="counters">{selected.map(p => <span key={p} className={count > limits[p] ? 'over-limit' : ''}><PlatformIcon platform={p} decorative/>{p} <strong>{count.toLocaleString()} / {limits[p].toLocaleString()}</strong></span>)}</div><label className="field-label" htmlFor="image">Image URL <span>optional</span></label><div className="input-with-icon"><ImageIcon size={17}/><input id="image" type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://example.com/image.jpg"/></div>{image && /^https?:\/\//.test(image) && <img key={image} className="image-preview" src={image} alt="Image preview" onError={e => { e.currentTarget.alt = 'Image could not be loaded'; }}/>}<label className="field-label" htmlFor="date">Schedule for</label><DateTimePicker id="date" value={date} onChange={setDate}/>{error && <p role="alert" className="post-error">{error}</p>}<div className="form-actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" type="submit" loading={busy} loadingText="Scheduling…" startIcon={<CalendarDays size={16}/>} disabled={over || !content.trim() || !selected.length || !isFuture(date)}>Schedule post</Button></div></form>; return inline ? <section className="route-page composer-page"><h1>Create post</h1><div className="route-card">{form}</div></section> : <Modal title="Create a post" onClose={onClose}>{form}</Modal>; }
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
