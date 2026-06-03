import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, LogOut, LayoutDashboard, ClipboardList, Database, FolderOpen, Award, GraduationCap, FileQuestion, Users, Plus, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ─── Design tokens ──────────────────────────────────────────────────────────

export const tokens = {
  bg: '#f8f9ff',
  ivory: '#eff4ff',
  card: '#ffffff',
  ink: '#0b1c30',
  text: '#3a4250',
  muted: '#5f6a78',
  subtle: '#8792a2',
  hairline: '#e2e8f0',
  hairlineSoft: '#eef1f7',
  indigo: '#4f46e5',
  indigoSoft: '#eef0fb',
  indigoBorder: '#dadcf5',
  navy: '#1e3a8a',
  good: '#15803d',
  warn: '#b45309',
  bad: '#ba1a1a',
  serif: '"Manrope", system-ui, sans-serif',
  sans: '"Manrope", system-ui, sans-serif',
  mono: '"Manrope", system-ui, sans-serif',
};

// ─── Page shell ─────────────────────────────────────────────────────────────

export function PageShell({ children, maxWidth = 1200 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <main style={{
      minHeight: '100vh',
      background: tokens.bg,
      fontFamily: tokens.sans,
      color: tokens.ink,
    }}>
      <div style={{ padding: '32px 40px 56px', maxWidth, margin: '0 auto' }}>
        {children}
      </div>
    </main>
  );
}

// ─── Top bar (role-aware) ───────────────────────────────────────────────────

const HIDDEN_PATHS = ['/'];
function isHidden(pathname: string): boolean {
  if (HIDDEN_PATHS.includes(pathname)) return true;
  // TakeExam has its own sticky bar with timer
  if (/^\/student\/exam\/[^/]+$/.test(pathname)) return true;
  return false;
}

const NAV_BY_ROLE: Record<'STUDENT' | 'INSTRUCTOR' | 'ADMIN',
  { label: string; href: string }[]> = {
  STUDENT: [
    { label: 'Sınavlarım', href: '/student' },
    { label: 'Sonuçlar', href: '/student/my-results' },
    { label: 'Bildirimler', href: '/notifications' },
  ],
  INSTRUCTOR: [
    { label: 'Sınavlar', href: '/instructor' },
    { label: 'Soru Bankası', href: '/instructor/questions' },
    { label: 'Kategoriler', href: '/instructor/categories' },
    { label: 'Bildirimler', href: '/notifications' },
  ],
  ADMIN: [
    { label: 'Genel Bakış', href: '/admin' },
    { label: 'Sınavlar', href: '/admin?tab=exams' },
    { label: 'Sorular', href: '/admin?tab=questions' },
    { label: 'Katılımlar', href: '/admin?tab=submissions' },
    { label: 'Bildirimler', href: '/notifications' },
  ],
};

function pickRole(roles: string[]): 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' {
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('INSTRUCTOR')) return 'INSTRUCTOR';
  return 'STUDENT';
}

function initialsFor(username?: string): string {
  if (!username) return 'QL';
  const parts = username.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function roleLabel(role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'): string {
  if (role === 'ADMIN') return 'Yönetim';
  if (role === 'INSTRUCTOR') return 'Eğitmen';
  return 'Akademik';
}

export function TopBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const role = pickRole(user?.roles || []);
  const navItems = NAV_BY_ROLE[role];
  const notificationsHref = role === 'STUDENT' ? '/student/notifications' : '/student/notifications';

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data?.count ?? res.data ?? 0))
      .catch(() => {});
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated || isHidden(location.pathname)) return null;

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 40px',
      background: tokens.bg,
      borderBottom: `1px solid ${tokens.hairline}`,
      fontFamily: tokens.sans,
      position: 'sticky' as const, top: 0, zIndex: 50,
    }}>
      {/* Brand */}
      <Link to={`/${role.toLowerCase()}`} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        textDecoration: 'none', color: tokens.ink,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: tokens.indigo, color: '#fff',
          display: 'grid', placeItems: 'center',
          fontFamily: tokens.serif, fontSize: 18, fontStyle: 'italic' as const,
        }}>Q</div>
        <div style={{ lineHeight: 1.1 }}>
          <strong style={{
            fontFamily: tokens.serif, fontSize: 18,
            fontWeight: 400, letterSpacing: '-0.01em', display: 'block',
          }}>Quizlab</strong>
          <span style={{
            fontFamily: tokens.mono, fontSize: 10,
            color: tokens.subtle, letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
          }}>{roleLabel(role)}</span>
        </div>
      </Link>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {navItems.map(item => {
          const [itemPath, itemQuery] = item.href.split('?');
          const currentFull = location.pathname + location.search;
          const active = itemQuery
            ? currentFull === item.href
            : (location.pathname === itemPath && !location.search)
              || (itemPath !== '/' && location.pathname.startsWith(itemPath + '/'));
          return (
            <Link key={item.href} to={item.href} style={{
              padding: '8px 14px', borderRadius: 8,
              background: active ? tokens.indigoSoft : 'transparent',
              color: active ? tokens.indigo : tokens.text,
              fontSize: 13.5, fontWeight: 500,
              textDecoration: 'none',
            }}>{item.label}</Link>
          );
        })}
      </nav>

      {/* Right: notifications + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={() => navigate(notificationsHref)}
          title="Bildirimler"
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'transparent',
            border: `1px solid ${tokens.hairline}`,
            color: tokens.text,
            display: 'grid', placeItems: 'center',
            cursor: 'pointer', position: 'relative' as const,
          }}>
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              minWidth: 14, height: 14, padding: '0 4px',
              borderRadius: 999, background: tokens.indigo, color: '#fff',
              fontFamily: tokens.mono, fontSize: 9, fontWeight: 600,
              display: 'grid', placeItems: 'center', lineHeight: 1,
            }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: tokens.indigoSoft, color: tokens.indigo,
            display: 'grid', placeItems: 'center',
            fontFamily: tokens.serif, fontSize: 14, fontWeight: 400,
          }}>{initialsFor(user?.username)}</div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{
              fontSize: 13.5, color: tokens.ink, fontWeight: 500,
              maxWidth: 140, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
            }}>{user?.username || 'Kullanıcı'}</div>
            <div style={{
              fontFamily: tokens.mono, fontSize: 10,
              color: tokens.subtle, letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
            }}>{role}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Çıkış Yap"
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'transparent',
            border: `1px solid ${tokens.hairline}`,
            color: tokens.bad,
            display: 'grid', placeItems: 'center',
            cursor: 'pointer',
          }}>
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}

// ─── Atoms ──────────────────────────────────────────────────────────────────

export function LiveDot({ color = tokens.indigo }: { color?: string }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color,
        animation: 'qsPulse 1.8s ease-out infinite',
      }} />
      <span style={{ position: 'absolute', inset: 1, borderRadius: '50%', background: color }} />
    </span>
  );
}

type Tone = 'indigo' | 'slate' | 'ink';
export function CodeTag({ children, tone = 'indigo' }: { children: ReactNode; tone?: Tone }) {
  const tones: Record<Tone, { bg: string; fg: string; br: string }> = {
    indigo: { bg: '#eef0fb', fg: '#3730a3', br: '#dadcf5' },
    slate:  { bg: '#f1f3f6', fg: '#475569', br: '#e2e8f0' },
    ink:    { bg: tokens.ink, fg: tokens.bg, br: tokens.ink },
  };
  const t = tones[tone];
  return (
    <span style={{
      fontFamily: tokens.mono,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      padding: '3px 7px', borderRadius: 4,
      background: t.bg, color: t.fg, border: `1px solid ${t.br}`,
    }}>{children}</span>
  );
}

export function Kicker({ children, color = tokens.subtle }: { children: ReactNode; color?: string }) {
  return (
    <div style={{
      fontFamily: tokens.mono,
      fontSize: 11, color, letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
      fontWeight: 500,
    }}>{children}</div>
  );
}

export function Stat({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div style={{
      padding: '20px 22px', background: tokens.card,
      border: `1px solid ${tokens.hairline}`, borderRadius: 14,
      display: 'flex', flexDirection: 'column', gap: 4, position: 'relative',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 18, bottom: 18, width: 3,
        borderRadius: '0 3px 3px 0',
        background: accent ?? '#e2e3eb',
      }} />
      <div style={{
        fontFamily: tokens.mono,
        fontSize: 11, color: '#7a7a87', letterSpacing: '0.08em',
        textTransform: 'uppercase' as const, fontWeight: 500,
      }}>{label}</div>
      <div style={{
        fontFamily: tokens.serif,
        fontSize: 40, lineHeight: 1, color: tokens.ink,
        letterSpacing: '-0.02em', marginTop: 2, fontWeight: 800,
      }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 12.5, color: '#7a7a87', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

export function SectionHeader({ kicker, title, count, action, sub }: {
  kicker?: string; title: string; count?: number; action?: ReactNode; sub?: string;
}) {
  return (
    <header style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 16, marginBottom: 18, paddingBottom: 14,
      borderBottom: `1px solid ${tokens.hairline}`,
    }}>
      <div>
        {kicker && (
          <div style={{
            fontFamily: tokens.mono,
            fontSize: 11, color: tokens.subtle, letterSpacing: '0.12em',
            textTransform: 'uppercase' as const, marginBottom: 6,
          }}>{kicker}</div>
        )}
        <h2 style={{
          margin: 0, fontFamily: tokens.serif,
          fontSize: 28, fontWeight: 700, color: tokens.ink,
          letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'baseline', gap: 10,
        }}>
          {title}
          {count != null && (
            <span style={{
              fontFamily: tokens.mono,
              fontSize: 14, color: tokens.subtle, fontWeight: 500,
            }}>({String(count).padStart(2, '0')})</span>
          )}
        </h2>
        {sub && (
          <div style={{
            fontSize: 13, color: tokens.muted, marginTop: 6, maxWidth: 620,
          }}>{sub}</div>
        )}
      </div>
      {action}
    </header>
  );
}

export function Crumbs({ items }: { items: string[] }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: tokens.mono,
      fontSize: 11, color: tokens.subtle, letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      marginBottom: 18, flexWrap: 'wrap' as const,
    }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: i === items.length - 1 ? tokens.ink : tokens.subtle }}>{it}</span>
          {i < items.length - 1 && <span style={{ opacity: 0.5 }}>/</span>}
        </span>
      ))}
    </div>
  );
}

type BtnVariant = 'primary' | 'ghost' | 'outline' | 'danger' | 'quiet' | 'dark';
export function Btn({
  variant = 'ghost', children, icon, iconR, style, type = 'button', ...rest
}: {
  variant?: BtnVariant;
  children: ReactNode;
  icon?: ReactNode;
  iconR?: ReactNode;
  style?: CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const variants: Record<BtnVariant, { bg: string; fg: string; br: string }> = {
    primary: { bg: tokens.navy, fg: '#fff', br: tokens.navy },
    ghost:   { bg: '#fff', fg: tokens.text, br: '#e2e2e8' },
    outline: { bg: '#fff', fg: tokens.indigo, br: '#d8dafd' },
    danger:  { bg: '#fff', fg: tokens.bad, br: '#fecaca' },
    quiet:   { bg: 'transparent', fg: tokens.indigo, br: 'transparent' },
    dark:    { bg: tokens.ink, fg: '#fff', br: tokens.ink },
  };
  const v = variants[variant];
  return (
    <button {...rest} type={type} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '10px 14px', background: v.bg, color: v.fg,
      border: `1px solid ${v.br}`, borderRadius: 10,
      fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
      cursor: rest.disabled ? 'not-allowed' : 'pointer',
      opacity: rest.disabled ? 0.55 : 1,
      ...style,
    }}>
      {icon}{children}{iconR}
    </button>
  );
}

export function HeroTitle({ children, accent = true }: { children: ReactNode; accent?: boolean }) {
  return (
    <h1 style={{
      margin: 0, fontFamily: tokens.serif,
      fontSize: 48, fontWeight: 800, color: tokens.ink,
      letterSpacing: '-0.025em', lineHeight: 1.05,
    }}>
      {children}
      {accent && <span style={{ color: tokens.indigo }}>.</span>}
    </h1>
  );
}

// ─── Charts ──────────────────────────────────────────────────────────────────

export function Sparkline({
  data, color = tokens.indigo, width = 80, height = 22, fill = true,
}: { data: number[]; color?: string; width?: number; height?: number; fill?: boolean }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const area = fill ? `0,${height} ${pts} ${width},${height}` : null;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && area && <polygon points={area} fill={color} opacity={0.12} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function MiniBar({
  data, color = tokens.indigo, width = 100, height = 28,
}: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const bw = width / data.length;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = (v / max) * height;
        return (
          <rect key={i} x={i * bw + 1} y={height - h} width={Math.max(bw - 2, 1)} height={h}
            fill={color} opacity={0.7} rx={1} />
        );
      })}
    </svg>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function scoreLabel(pct: number): { text: string; color: string } {
  if (pct >= 85) return { text: '↑ ÇOK İYİ', color: tokens.good };
  if (pct >= 70) return { text: '— İYİ', color: tokens.indigo };
  return { text: '↓ GELİŞTİR', color: tokens.warn };
}

export function formatTrDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatTrDateShort(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── Sidebar app shell (role-aware) ───────────────────────────────────

type SideItem = { label: string; href: string; icon: ReactNode; dot?: boolean };
type RoleNav = { items: SideItem[]; cta?: { label: string; href: string } };

const SIDE_NAV: Record<'STUDENT' | 'INSTRUCTOR' | 'ADMIN', RoleNav> = {
  STUDENT: {
    items: [
      { label: 'Sınavlarım', href: '/student', icon: <ClipboardList size={18} /> },
      { label: 'Sonuçlar', href: '/student/my-results', icon: <Award size={18} /> },
      { label: 'Bildirimler', href: '/notifications', icon: <Bell size={18} />, dot: true },
    ],
  },
  INSTRUCTOR: {
    items: [
      { label: 'Panel', href: '/instructor', icon: <LayoutDashboard size={18} /> },
      { label: 'Sınavlar', href: '/instructor', icon: <ClipboardList size={18} /> },
      { label: 'Soru Bankası', href: '/instructor/questions', icon: <Database size={18} /> },
      { label: 'Kategoriler', href: '/instructor/categories', icon: <FolderOpen size={18} /> },
      { label: 'Bildirimler', href: '/notifications', icon: <Bell size={18} />, dot: true },
    ],
    cta: { label: 'Yeni Sınav', href: '/instructor/create-exam' },
  },
  ADMIN: {
    items: [
      { label: 'Genel Bakış', href: '/admin', icon: <LayoutDashboard size={18} /> },
      { label: 'Sınavlar', href: '/admin?tab=exams', icon: <ClipboardList size={18} /> },
      { label: 'Sorular', href: '/admin?tab=questions', icon: <FileQuestion size={18} /> },
      { label: 'Katılımlar', href: '/admin?tab=submissions', icon: <Users size={18} /> },
      { label: 'Bildirimler', href: '/notifications', icon: <Bell size={18} />, dot: true },
    ],
  },
};

function panelLabel(role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'): string {
  if (role === 'ADMIN') return 'Yönetici Paneli';
  if (role === 'INSTRUCTOR') return 'Eğitmen Paneli';
  return 'Öğrenci Paneli';
}

export const SIDEBAR_WIDTH = 256;

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = pickRole(user?.roles || []);
  const { items, cta } = SIDE_NAV[role];

  const [unread, setUnread] = useState(0);
  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(res => setUnread(res.data?.count ?? res.data ?? 0))
      .catch(() => {});
  }, [location.pathname]);

  const isActive = (href: string) => {
    const [path, query] = href.split('?');
    if (query !== undefined) return (location.pathname + location.search) === href;
    return location.pathname === path && !location.search;
  };
  const activeIdx = items.findIndex(it => isActive(it.href));

  const navItemStyle = (active: boolean): CSSProperties => ({
    position: 'relative',
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', borderRadius: 10,
    textDecoration: 'none', fontSize: 14,
    background: active ? '#e9eeff' : 'transparent',
    color: active ? tokens.navy : tokens.text,
    fontWeight: active ? 700 : 500,
    cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit',
  });

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH,
      background: tokens.card, borderRight: `1px solid ${tokens.hairline}`,
      display: 'flex', flexDirection: 'column', zIndex: 50,
      fontFamily: tokens.sans,
    }}>
      {/* Brand */}
      <Link to={`/${role.toLowerCase()}`} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '20px', textDecoration: 'none', color: tokens.ink,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, background: tokens.navy, color: '#fff',
          display: 'grid', placeItems: 'center',
        }}><GraduationCap size={20} /></div>
        <div style={{ lineHeight: 1.2 }}>
          <strong style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', display: 'block' }}>QuizLab</strong>
          <span style={{ fontSize: 11, color: tokens.subtle, fontWeight: 600 }}>{panelLabel(role)}</span>
        </div>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {items.map((item, idx) => {
          const active = idx === activeIdx;
          return (
            <Link key={item.label} to={item.href} style={navItemStyle(active)}>
              {active && <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 4, height: 22, background: tokens.navy, borderRadius: '0 3px 3px 0' }} />}
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                {item.icon}
                {item.dot && unread > 0 && (
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: tokens.bad, border: `2px solid ${tokens.card}` }} />
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: CTA + settings + user */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {cta && (
          <button type="button" onClick={() => navigate(cta.href)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '12px 14px', borderRadius: 12,
            background: tokens.navy, color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(30,58,138,0.18)',
          }}>
            <Plus size={18} />{cta.label}
          </button>
        )}
        <div style={{ height: 1, background: tokens.hairline, margin: '6px 2px' }} />
        <button type="button" style={navItemStyle(false)} title="Ayarlar (yakında)">
          <Settings size={18} />Ayarlar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: tokens.indigoSoft, color: tokens.indigo,
            display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13,
          }}>{initialsFor(user?.username)}</div>
          <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13.5, fontWeight: 600, color: tokens.ink,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{user?.username || 'Kullanıcı'}</div>
            <div style={{ fontSize: 11, color: tokens.subtle, fontWeight: 600 }}>{panelLabel(role).replace(' Paneli', '')}</div>
          </div>
          <button type="button" onClick={logout} title="Çıkış Yap" style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'transparent', border: `1px solid ${tokens.hairline}`,
            color: tokens.bad, display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // No sidebar on the public landing or the focused exam-taking screen.
  if (!isAuthenticated || isHidden(location.pathname)) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg }}>
      <Sidebar />
      <main style={{ marginLeft: SIDEBAR_WIDTH, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
