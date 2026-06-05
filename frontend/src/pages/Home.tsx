import { Link, useNavigate } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { ArrowRight, LogIn, LogOut, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tokens, Btn } from '../components/academic-ui';

export default function Home() {
  const { isAuthenticated, user, login, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const roles = ['ADMIN', 'INSTRUCTOR', 'STUDENT'].filter(r => hasRole(r));
    if (roles.length === 1) {
      const target = roles[0] === 'ADMIN' ? '/admin'
        : roles[0] === 'INSTRUCTOR' ? '/instructor'
        : '/student';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, hasRole, navigate]);

  const roleCards = [
    { icon: GraduationCap, title: 'Öğrenci', desc: 'Sınavlara katıl, sonuçlarını ve performansını gör.' },
    { icon: BookOpen, title: 'Eğitmen', desc: 'Soru bankası yönet, kolayca sınav oluştur ve detaylı istatistikleri takip et.' },
    { icon: ShieldCheck, title: 'Yönetici', desc: 'Kullanıcı ve sınav yönetimi, sistem geneli raporlar.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      {/* Navbar */}
      <header style={{
        maxWidth: 1200, margin: '0 auto', padding: '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: tokens.navy, color: '#fff',
            display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 19,
          }}>Q</div>
          <div style={{ lineHeight: 1.15 }}>
            <strong style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em' }}>QuizLab</strong>
            <div style={{ fontSize: 10.5, color: tokens.subtle, fontWeight: 600, letterSpacing: '0.08em' }}>AKADEMİK</div>
          </div>
        </div>
        {!isAuthenticated && (
          <Btn variant="primary" onClick={login} icon={<LogIn size={15} />}>Giriş Yap</Btn>
        )}
      </header>

      {!isAuthenticated ? (
        <>
          {/* Hero */}
          <section style={{
            maxWidth: 1200, margin: '0 auto', padding: '48px 40px 64px',
            display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: tokens.indigo, letterSpacing: '0.12em' }}>
                AKADEMİK SINAV PLATFORMU
              </div>
              <h1 style={{ margin: '16px 0 0', fontSize: 52, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08 }}>
                Sınav oluştur, uygula<br />ve değerlendir<span style={{ color: tokens.indigo }}>.</span>
              </h1>
              <p style={{ margin: '20px 0 0', maxWidth: 520, color: tokens.muted, fontSize: 17, lineHeight: 1.7 }}>
                Öğrenciler için odaklı sınav deneyimi, eğitmenler için kolay yönetim ve sonuç takibi.
                Tek bir akademik arayüzde.
              </p>
              <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 18 }}>
                <Btn variant="primary" onClick={login} icon={<LogIn size={15} />} style={{ padding: '13px 22px', fontSize: 15 }}>
                  Giriş Yap
                </Btn>
                <span style={{ color: tokens.muted, fontSize: 14, fontWeight: 600 }}>Daha fazla bilgi →</span>
              </div>
            </div>

            {/* Product preview (decorative) */}
            <div style={{
              background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 16,
              boxShadow: '0 20px 44px rgba(30,58,138,0.08)', padding: 18,
            }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: tokens.hairline }} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[{ l: 'Aktif Sınavlar', v: '12' }, { l: 'Ortalama Başarı', v: '%76' }].map(s => (
                  <div key={s.l} style={{ background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, color: tokens.subtle, fontWeight: 600 }}>{s.l}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: tokens.navy, marginTop: 4 }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, color: tokens.subtle, fontWeight: 600, marginBottom: 12 }}>Son Sınavlar</div>
                {[80, 60, 45].map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: tokens.indigo, flexShrink: 0 }} />
                    <span style={{ flex: 1, height: 7, borderRadius: 99, background: '#e3e8f5', overflow: 'hidden' }}>
                      <span style={{ display: 'block', width: `${w}%`, height: '100%', background: tokens.indigo, opacity: 0.7 }} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Roles */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 40px 72px' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Her role özel araçlar</h2>
              <p style={{ margin: '10px 0 0', color: tokens.muted, fontSize: 15 }}>
                QuizLab, eğitim sürecini herkes için verimli hale getirir.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {roleCards.map(c => (
                <article key={c.title} style={{
                  background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14,
                  padding: 26, textAlign: 'center',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: tokens.indigoSoft, color: tokens.indigo,
                    display: 'grid', placeItems: 'center', margin: '0 auto 16px',
                  }}>
                    <c.icon size={22} />
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{c.title}</h3>
                  <p style={{ margin: 0, color: tokens.muted, fontSize: 13.5, lineHeight: 1.6 }}>{c.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer style={{ borderTop: `1px solid ${tokens.hairline}` }}>
            <div style={{
              maxWidth: 1200, margin: '0 auto', padding: '22px 40px',
              display: 'flex', justifyContent: 'space-between', color: tokens.subtle, fontSize: 13,
            }}>
              <span style={{ fontWeight: 700, color: tokens.text }}>QuizLab</span>
              <span>© 2026 QuizLab · Tüm hakları saklıdır.</span>
            </div>
          </footer>
        </>
      ) : (
        /* Authenticated: role selection */
        <section style={{ maxWidth: 560, margin: '40px auto', padding: '0 40px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: tokens.indigo, letterSpacing: '0.12em' }}>OTURUM AÇIK</div>
          <h2 style={{ margin: '10px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {user?.username ? `Merhaba, ${user.username}` : 'Hoş geldin'}<span style={{ color: tokens.indigo }}>.</span>
          </h2>
          <p style={{ margin: '12px 0 0', color: tokens.muted, fontSize: 15 }}>Devam etmek istediğin paneli seç.</p>
          <div style={{ marginTop: 24, display: 'grid', gap: 10 }}>
            {hasRole('STUDENT') && <PanelLink to="/student" icon={<GraduationCap size={18} />} title="Öğrenci Paneli" sub="Sınavlarıma geç" />}
            {hasRole('INSTRUCTOR') && <PanelLink to="/instructor" icon={<BookOpen size={18} />} title="Eğitmen Paneli" sub="Sınavları yönet" />}
            {hasRole('ADMIN') && <PanelLink to="/admin" icon={<ShieldCheck size={18} />} title="Admin Paneli" sub="Sistemi yönet" />}
          </div>
          <Btn onClick={logout} icon={<LogOut size={14} />} style={{ marginTop: 20, width: '100%', justifyContent: 'center', padding: '12px 16px' }}>
            Çıkış Yap
          </Btn>
        </section>
      )}
    </div>
  );
}

function PanelLink({ to, icon, title, sub }: { to: string; icon: ReactNode; title: string; sub: string }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', background: tokens.card, border: `1px solid ${tokens.hairline}`,
      borderRadius: 12, textDecoration: 'none', color: tokens.ink,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: tokens.indigo }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 12, color: tokens.subtle, marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <ArrowRight size={14} style={{ color: tokens.subtle }} />
    </Link>
  );
}
