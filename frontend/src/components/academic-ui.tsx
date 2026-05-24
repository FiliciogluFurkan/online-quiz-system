import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ─── Design tokens ──────────────────────────────────────────────────────────

export const tokens = {
  bg: '#fbfaf7',
  ivory: '#faf9f6',
  card: '#ffffff',
  ink: '#13131f',
  text: '#3a3a48',
  muted: '#6b6b78',
  subtle: '#9a9aa6',
  hairline: '#ececf0',
  hairlineSoft: '#f0f0f3',
  indigo: '#4f46e5',
  indigoSoft: '#eef0fb',
  indigoBorder: '#dadcf5',
  good: '#15803d',
  warn: '#b45309',
  bad: '#b91c1c',
  serif: '"Instrument Serif", Georgia, serif',
  sans: '"Inter Tight", Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
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
    { label: 'Sonuçlar', href: '/instructor?view=results' },
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
        letterSpacing: '-0.02em', marginTop: 2,
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
          fontSize: 28, fontWeight: 400, color: tokens.ink,
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
    primary: { bg: tokens.indigo, fg: '#fff', br: tokens.indigo },
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
      fontSize: 48, fontWeight: 400, color: tokens.ink,
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
