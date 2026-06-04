import { User, Mail, ShieldCheck, KeyRound, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import keycloak from '../keycloak';
import { tokens, Btn } from '../components/academic-ui';

function roleLabel(role: string): string {
  if (role === 'ADMIN') return 'Yönetici';
  if (role === 'INSTRUCTOR') return 'Eğitmen';
  if (role === 'STUDENT') return 'Öğrenci';
  return role;
}

const KNOWN_ROLES = ['ADMIN', 'INSTRUCTOR', 'STUDENT'];

function initialsFor(name?: string): string {
  if (!name) return 'K';
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return 'K';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const cardStyle: React.CSSProperties = {
  background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14,
  padding: 24, boxShadow: '0 4px 20px rgba(30,58,138,0.06)',
};
const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
};

export default function Settings() {
  const { user, logout } = useAuth();

  const roles = (user?.roles || []).filter(r => KNOWN_ROLES.includes(r));

  const openAccountConsole = () => {
    try {
      window.open(keycloak.createAccountUrl(), '_blank', 'noopener');
    } catch {
      window.open('http://localhost:8180/realms/quiz-realm/account', '_blank', 'noopener');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '36px 40px 64px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>Ayarlar</h1>
          <p style={{ margin: '6px 0 0', color: tokens.muted, fontSize: 15 }}>Hesap bilgilerini görüntüle ve güvenlik ayarlarını yönet.</p>
        </div>

        {/* Profil */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: tokens.indigoSoft, color: tokens.indigo, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
              {initialsFor(user?.username)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: tokens.ink }}>{user?.username || 'Kullanıcı'}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {roles.length > 0 ? roles.map(r => (
                  <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: '#e5eeff', color: tokens.navy, fontSize: 12, fontWeight: 700 }}>
                    <ShieldCheck size={13} />{roleLabel(r)}
                  </span>
                )) : <span style={{ fontSize: 12.5, color: tokens.subtle }}>Rol bilgisi yok</span>}
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${tokens.hairlineSoft}`, marginTop: 12 }}>
            <div style={rowStyle}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: tokens.ivory, color: tokens.muted, display: 'grid', placeItems: 'center', flexShrink: 0 }}><User size={17} /></span>
              <div>
                <div style={{ fontSize: 12, color: tokens.subtle, fontWeight: 600 }}>Kullanıcı Adı</div>
                <div style={{ fontSize: 14.5, color: tokens.ink, fontWeight: 600 }}>{user?.username || '—'}</div>
              </div>
            </div>
            <div style={{ ...rowStyle, borderTop: `1px solid ${tokens.hairlineSoft}` }}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: tokens.ivory, color: tokens.muted, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Mail size={17} /></span>
              <div>
                <div style={{ fontSize: 12, color: tokens.subtle, fontWeight: 600 }}>E-posta</div>
                <div style={{ fontSize: 14.5, color: tokens.ink, fontWeight: 600 }}>{user?.email || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hesap güvenliği */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <KeyRound size={19} style={{ color: tokens.navy }} />Hesap Güvenliği
          </h3>
          <p style={{ margin: '0 0 18px', fontSize: 13.5, color: tokens.muted, lineHeight: 1.55 }}>
            Şifre değişikliği ve oturum yönetimi Keycloak hesap konsolu üzerinden yapılır. Aşağıdaki bağlantı yeni sekmede açılır.
          </p>
          <Btn variant="primary" onClick={openAccountConsole} icon={<ExternalLink size={15} />}>Şifreyi Değiştir / Hesabı Yönet</Btn>
        </div>

        {/* Oturum */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogOut size={19} style={{ color: tokens.bad }} />Oturum
          </h3>
          <p style={{ margin: '0 0 18px', fontSize: 13.5, color: tokens.muted, lineHeight: 1.55 }}>
            Bu cihazdaki oturumunu sonlandır.
          </p>
          <Btn variant="danger" onClick={logout} icon={<LogOut size={15} />}>Çıkış Yap</Btn>
        </div>
      </div>
    </div>
  );
}
