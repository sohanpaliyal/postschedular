import { cn } from './ui/cn';
import { useEffect, useRef, useState } from 'react';
import {
  Search,
  UsersRound,
  BarChart3,
  LayoutGrid,
  Files,
  Bell,
  Settings,
  Upload,
  ChevronDown,
  Plus,
  X,
  CalendarDays,
  Check,
  RotateCcw,
  PanelLeft,
  Command,
} from 'lucide-react';
import { Button } from './components/Button';
import { PlatformIcon } from './components/PlatformIcon';
import { DashboardPanels } from './components/DashboardPanels';
import { AllPostsPage } from './pages/AllPostsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { usePreferences } from './state/preferences';
import { usePosts } from './hooks/usePosts';
import { storage } from './services/storage';
import { scopedQuery } from './lib/routeQuery';
import { SocialAccountsPage } from './pages/SocialAccountsPage';
import { platforms, type Platform, type Post } from './types/post';
import { Avatar } from './components/Avatar';
import { Modal } from './components/Modal';
import { MotionChevron } from './components/MotionChevron';
import { Composer } from './components/Composer';
import { ThemeSwitch } from './components/ThemeSwitch';

const routes = [
  { path: '/', label: 'Dashboard', icon: LayoutGrid },
  { path: '/posts', label: 'All posts', icon: CalendarDays },
  { path: '/compose', label: 'Create post', icon: Plus },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/social-accounts', label: 'Social accounts', icon: UsersRound },
  { path: '/settings', label: 'Settings', icon: Settings },
];
export default function App() {
  const preferences = usePreferences();
  const [collapsed, setCollapsed] = useState(() => storage.get('flintzy-sidebar') === 'collapsed');
  const [menuSearch, setMenuSearch] = useState('');
  const sidebarSearchRef = useRef<HTMLInputElement>(null);
  const [panel, setPanel] = useState<string | null>(null);
  const [profile, setProfile] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [pathname, setPathname] = useState(location.pathname);
  const currentPath = pathname.replace(/\/$/, '') || '/';
  const currentRoute = routes.find((route) => route.path === currentPath);
  const allPostsPage = pathname === '/posts' || pathname === '/posts/';
  const analyticsPage = pathname === '/analytics' || pathname === '/analytics/';
  const [composerDate, setComposerDate] = useState('');
  const [composer, setComposer] = useState(false);
  const [detail, setDetail] = useState<Post | null>(null);
  const { posts, loading, error: loadError, pending, repository } = usePosts();
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');
  const initial = scopedQuery(currentPath, location.search);
  const [query, setQuery] = useState(initial.get('q') || '');
  const [platform, setPlatform] = useState(initial.get('platform') || 'all');
  const [status, setStatus] = useState(initial.get('status') || 'all');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    storage.set('flintzy-sidebar', collapsed ? 'collapsed' : 'expanded');
  }, [collapsed]);
  useEffect(() => {
    const params = scopedQuery(currentPath, location.search);
    if (currentPath === '/posts' || currentPath === '/analytics') {
      params.delete('q');
      params.delete('platform');
      params.delete('status');
      if (query) params.set('q', query);
      if (platform !== 'all') params.set('platform', platform);
      if (status !== 'all') params.set('status', status);
    }
    history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params : ''}`);
  }, [currentPath, query, platform, status]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setCollapsed(false);
        requestAnimationFrame(() => sidebarSearchRef.current?.focus());
      }
      if (e.key === 'Escape') {
        setMenuSearch('');
        setComposer(false);
        setDetail(null);
        setPanel(null);
        setProfile(false);
        setMobile(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  const filtered = posts
    .filter(
      (p) =>
        p.content.toLowerCase().includes(query.toLowerCase()) &&
        (platform === 'all' || p.platforms.includes(platform as Platform)) &&
        (status === 'all' || p.status === status),
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  function navigate(path: string) {
    setMenuSearch('');
    // A new page starts with its own defaults, not the previous page's filters.
    const params = scopedQuery(path, path === currentPath ? location.search : '');
    setQuery(params.get('q') || '');
    setPlatform(params.get('platform') || 'all');
    setStatus(params.get('status') || 'all');
    history.pushState(null, '', path + (params.size ? '?' + params : ''));
    setPathname(path);
    setPanel(null);
    setMobile(false);
    window.scrollTo({ top: 0 });
  }
  useEffect(() => {
    const back = () => {
      const params = scopedQuery(location.pathname, location.search);
      setPathname(location.pathname);
      setQuery(params.get('q') || '');
      setPlatform(params.get('platform') || 'all');
      setStatus(params.get('status') || 'all');
    };
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  }, []);
  function openComposer(day?: Date) {
    if (day) {
      const date = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9);
      if (date.getTime() <= Date.now()) date.setTime(Date.now() + 3600000);
      // DateTimePicker accepts a UTC ISO string as its initial value.
      setComposerDate(date.toISOString());
    } else setComposerDate('');
    setComposer(true);
  }
  const filters = {
    query,
    platform,
    status,
    onQuery: setQuery,
    onPlatform: setPlatform,
    onStatus: setStatus,
    searchRef,
  };
  function clearFilters() {
    setQuery('');
    setPlatform('all');
    setStatus('all');
  }
  function exportPosts() {
    const cell = (value: string) => '"' + value.replaceAll('"', '""') + '"';
    const rows = [
      ['ID', 'Content', 'Platforms', 'Scheduled at (UTC)', 'Status', 'Error'],
      ...filtered.map((p) => [
        p.id,
        p.content,
        p.platforms.join(', '),
        p.scheduledAt,
        p.status,
        p.errorMessage || '',
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(['\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n')], {
        type: 'text/csv;charset=utf-8;',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flintzy-posts.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function retry(post: Post) {
    const result = await repository.retry(post);
    if (result === 'cancelled') return;
    setNoticeType(result === 'failed' ? 'error' : 'success');
    setNotice(
      result === 'failed'
        ? 'Retry failed — your post has been restored.'
        : 'Post rescheduled and added back to the queue.',
    );
  }
  return (
    <div className={cn('app-shell flex items-start min-h-[100vh]')}>
      {mobile && (
        <Button
          variant="unstyled"
          className={cn('mobile-backdrop')}
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        className={cn(`sidebar ${collapsed ? 'collapsed' : ''} ${mobile ? 'mobile-open' : ''}`)}
        aria-label="Main navigation"
      >
        <div className={cn('brand-row h-[58px] relative flex items-start')}>
          <Button
            variant="unstyled"
            className={cn('brand-mark p-[0]')}
            aria-label="Flintzy home"
            onClick={() => navigate('/')}
          >
            <svg viewBox="0 0 32 32" fill="currentColor">
              <path d="M12 2h9v9h9v9h-9v10h-9v-9H2v-9h10z" />
            </svg>
          </Button>
          <span
            className={cn(
              'label ml-[10px] inline-flex h-[31px] items-center gap-[5px] text-[19px] leading-none tracking-[-0.5px]',
            )}
          >
            <span className="text-muted font-medium">Post</span>
            <span className="text-foreground [font-family:Georgia,serif]">Scheduler</span>
          </span>
          <Button
            variant="unstyled"
            className={cn(
              'collapse-button absolute top-[0] rounded-full place-items-center p-[0] leading-[0]',
            )}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            <MotionChevron horizontal flipped={collapsed} />
          </Button>
        </div>
        <div
          className={cn(
            'sidebar-search h-[39px] [box-shadow:0_1px_2px_#00000003] flex items-center whitespace-nowrap overflow-hidden',
          )}
        >
          <Button
            variant="unstyled"
            className={cn('grid place-items-center [flex:0_0_18px] p-[0] [color:inherit]')}
            aria-label="Search menus"
            onClick={() => {
              setCollapsed(false);
              requestAnimationFrame(() => sidebarSearchRef.current?.focus());
            }}
          >
            <Search size={18} />
          </Button>
          <input
            ref={sidebarSearchRef}
            className={cn(
              'app-input',
              cn(
                'sidebar-menu-input min-w-[0] w-full flex-1 border-0 [background:transparent] [font:inherit] label',
              ),
            )}
            type="search"
            aria-label="Search menus"
            placeholder="Search"
            value={menuSearch}
            onChange={(event) => setMenuSearch(event.target.value)}
            tabIndex={collapsed ? -1 : 0}
          />
          <span className={cn('ml-[auto] flex gap-[4px] label')} aria-hidden="true">
            <kbd className={cn('app-kbd')}>
              <Command size={14} />
            </kbd>
            <kbd className={cn('app-kbd')}>S</kbd>
          </span>
        </div>
        <div
          className={cn('section-heading flex items-center tracking-[0.045em] whitespace-nowrap')}
        >
          MAIN
        </div>
        <nav>
          {routes
            .filter((route) => route.label.toLowerCase().includes(menuSearch.trim().toLowerCase()))
            .map((route) => ({ ...route, selected: currentPath === route.path }))
            .map(({ path, label, icon: Icon, selected }) => (
              <a
                key={path}
                href={path}
                aria-current={selected ? 'page' : undefined}
                className={cn(
                  `nav-item flex items-center whitespace-nowrap text-left all-posts-link ${selected ? 'selected' : ''}`,
                )}
                title={collapsed ? label : undefined}
                onClick={(e) => {
                  setMenuSearch('');
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    navigate(path);
                  }
                }}
              >
                <Icon size={20} />
                <span className={cn('label')}>{label}</span>
              </a>
            ))}
          {!routes.some((route) =>
            route.label.toLowerCase().includes(menuSearch.trim().toLowerCase()),
          ) && (
            <p className={cn('text-muted text-[12px] p-[12px]')} role="status">
              No menus found.
            </p>
          )}
        </nav>
        <div className={cn('sidebar-footer mt-[auto] relative')}>
          {profile && (
            <div className={cn('profile-menu absolute bottom-[70px] left-[0] w-[205px] flex-col')}>
              <strong>{preferences.name}</strong>
              <span>Demo workspace</span>
              <Button
                variant="unstyled"
                onClick={() => {
                  setCollapsed((c) => !c);
                  setProfile(false);
                }}
              >
                <PanelLeft size={16} /> Toggle sidebar
              </Button>
            </div>
          )}
          <Button
            variant="unstyled"
            className={cn('profile-button flex items-center overflow-hidden whitespace-nowrap')}
            aria-expanded={profile}
            onClick={() => setProfile((p) => !p)}
          >
            <Avatar id={preferences.avatarId} name={preferences.name} />
            <span className={cn('profile-name text-left flex gap-[2px] label')}>
              <strong>{preferences.name}</strong>
              <small>Designer</small>
            </span>
            <ChevronDown className={cn('label')} size={18} />
          </Button>
        </div>
      </aside>
      <main className={cn('workspace flex-1')}>
        <header
          className={cn(
            'topbar flex items-center justify-between [backdrop-filter:blur(14px)] isolate',
          )}
        >
          <div
            className={cn(
              'header-inner max-w-[1280px] [margin-inline:auto] flex items-center justify-between gap-[12px]',
            )}
          >
            <div className={cn('breadcrumb items-center')}>
              <Button
                variant="icon"
                className={cn(
                  'icon-button grid place-items-center p-[5px] rounded-[7px] mobile-menu',
                )}
                aria-label="Open navigation"
                onClick={() => setMobile(true)}
              >
                <PanelLeft size={20} />
              </Button>
              <strong>{currentRoute?.label || 'Dashboard'}</strong>
            </div>
            <div className={cn('header-actions flex items-center')}>
              <ThemeSwitch />
              <Button
                variant="unstyled"
                className={cn('header-settings')}
                onClick={() => navigate('/settings')}
              >
                <Settings size={15} />
                <span>Settings</span>
              </Button>
              <Button
                variant="unstyled"
                className={cn('header-notification p-[0]')}
                aria-label="Notifications"
                onClick={() => setPanel('Notification')}
              >
                <Bell size={17} />
              </Button>
              <Button
                variant="unstyled"
                className={cn('header-avatar p-[0] ml-[2px] grid place-items-center')}
                aria-label="Open profile"
                onClick={() => setPanel('Profile')}
              >
                <Avatar id={preferences.avatarId} name={preferences.name} />
              </Button>
            </div>
          </div>
        </header>
        {loadError ? (
          <section
            role="alert"
            className="mx-auto mt-[32px] max-w-[600px] rounded-[20px] border border-outline bg-surface p-[28px] text-foreground"
          >
            <h1 className="text-[22px] font-medium">Posts could not be loaded</h1>
            <p className="my-[16px] text-muted">{loadError}</p>
            <Button
              onClick={() => {
                void repository.load();
              }}
            >
              Try again
            </Button>
          </section>
        ) : currentPath === '/compose' ? (
          <Composer
            inline
            onClose={() => navigate('/posts')}
            onCreate={repository.create}
            onSave={() => {
              setNoticeType('success');
              setNotice('Your post is scheduled. Looking good!');
              navigate('/posts');
            }}
          />
        ) : currentPath === '/social-accounts' ? (
          <SocialAccountsPage posts={posts} />
        ) : currentPath === '/settings' ? (
          <SettingsPage
            onReset={() => {
              repository.reset();
              for (const platform of platforms) {
                try {
                  storage.remove(`flintzy-demo-${platform.toLowerCase()}-connected`);
                } catch {
                  /* Storage may be unavailable. */
                }
              }
            }}
          />
        ) : analyticsPage ? (
          <AnalyticsPage
            posts={filtered}
            filters={filters}
            loading={loading}
            onOpenPost={setDetail}
          />
        ) : allPostsPage ? (
          <AllPostsPage
            posts={filtered}
            pending={pending}
            onSelect={setDetail}
            onRetry={retry}
            onClear={clearFilters}
            filters={filters}
            loading={loading}
            onCreate={openComposer}
          />
        ) : (
          <>
            {' '}
            <section
              className={cn('welcome-row flex justify-between p-[0_1px]')}
              aria-label="Workspace welcome"
            >
              <div>
                <h2>
                  <span>
                    Good{' '}
                    {new Date().getHours() < 12
                      ? 'Morning'
                      : new Date().getHours() < 18
                        ? 'Afternoon'
                        : 'Evening'}
                    ,
                  </span>{' '}
                  {preferences.name.split(/\s+/)[0]}!
                </h2>
                <p>Plan your content and keep your social channels moving.</p>
              </div>
              <div className={cn('welcome-actions flex items-center shrink-[0]')}>
                <Button
                  variant="primary"
                  startIcon={<Plus size={18} />}
                  onClick={() => openComposer()}
                >
                  Create post
                </Button>
                <Button
                  variant="secondary"
                  startIcon={<Upload size={18} />}
                  endIcon={<ChevronDown size={18} />}
                  onClick={exportPosts}
                >
                  Export File
                </Button>
              </div>
            </section>
            <DashboardPanels
              posts={posts}
              pending={pending}
              loading={loading}
              onSelect={setDetail}
              onRetry={retry}
              onCreate={() => openComposer()}
              onNavigate={navigate}
            />
          </>
        )}
      </main>
      {notice && (
        <div
          className={cn(
            `toast fixed bottom-[25px] left-[50%] z-[100] [background:#30362b] rounded-[12px] [box-shadow:0_10px_30px_#0002] items-center gap-[12px] text-[12px] max-w-[calc(100vw_-_30px)] toast--${noticeType}`,
          )}
          role="status"
          aria-live="assertive"
        >
          {noticeType === 'error' ? <X size={16} /> : <Check size={16} />}
          {notice}
          <Button variant="unstyled" aria-label="Dismiss" onClick={() => setNotice('')}>
            <X size={15} />
          </Button>
        </div>
      )}
      {composer && (
        <Composer
          initialDate={composerDate}
          onClose={() => setComposer(false)}
          onCreate={repository.create}
          onSave={() => {
            setNoticeType('success');
            setComposer(false);
            setNotice('Your post is scheduled. Looking good!');
          }}
        />
      )}
      {detail && (
        <Modal title="Post details" onClose={() => setDetail(null)}>
          <span
            className={cn(
              `status inline-flex items-center gap-[5px] [text-transform:capitalize] ${pending.includes(detail.id) ? 'retrying' : detail.status}`,
            )}
          >
            <i />
            {pending.includes(detail.id) ? 'Retrying…' : detail.status}
          </span>
          <p className={cn('detail-content leading-[1.9] m-[24px_0]')}>{detail.content}</p>
          {detail.mediaUrl && (
            <img className={cn('detail-image')} src={detail.mediaUrl} alt="Post attachment" />
          )}
          <div
            className={cn(
              'detail-meta grid [grid-template-columns:110px_1fr] gap-[14px] m-[25px_0]',
            )}
          >
            <span>Platforms</span>
            <div className={cn('detail-platform-list flex-wrap')}>
              {detail.platforms.map((platform) => (
                <span key={platform}>
                  <PlatformIcon platform={platform} decorative />
                  {platform}
                </span>
              ))}
            </div>
            <span>Scheduled for</span>
            <strong>
              {new Date(detail.scheduledAt).toLocaleString([], {
                hour12: preferences.timeFormat === '12',
              })}
            </strong>
            <span>Time zone</span>
            <strong>{Intl.DateTimeFormat().resolvedOptions().timeZone}</strong>
          </div>
          {detail.errorMessage && (
            <p className={cn('post-error leading-[1.6] rounded-[7px] p-[9px_11px] mb-[2px]')}>
              {detail.errorMessage}
            </p>
          )}
          {detail.status === 'failed' && (
            <Button
              variant="primary"
              loading={pending.includes(detail.id)}
              loadingText="Retrying…"
              startIcon={<RotateCcw size={16} />}
              disabled={pending.includes(detail.id)}
              onClick={() => {
                void retry(detail);
                setDetail(null);
              }}
            >
              Retry post
            </Button>
          )}
        </Modal>
      )}
      {panel && (
        <Modal title={panel} onClose={() => setPanel(null)}>
          <div className={cn('empty-state text-center p-[42px_20px]')}>
            <Files size={32} />
            <h3>{`${panel} preview`}</h3>
            <p>Your post scheduling tools are available in Dashboard and All posts.</p>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Back to post queue
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
