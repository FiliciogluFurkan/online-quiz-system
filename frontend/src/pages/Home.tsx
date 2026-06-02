import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, LogIn, LogOut, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tokens, Kicker, Btn, CodeTag } from '../components/academic-ui';

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

  return (
    <main style={{
      minHeight: '100vh', background: tokens.bg,
      fontFamily: tokens.sans, color: tokens.ink,
    }}>
      {/* Top bar */}
      <header style={{
        padding: '20px 40px',
        borderBottom: `1px solid ${tokens.hairline}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: tokens.indigo, color: '#fff',
            display: 'grid', placeItems: 'center',
            fontFamily: tokens.serif, fontSize: 20, fontStyle: 'italic' as const,
          }}>Q</div>
          <div style={{ lineHeight: 1.15 }}>
            <strong style={{
              fontFamily: tokens.serif, fontSize: 20,
              fontWeight: 400, letterSpacing: '-0.01em',
            }}>Quizlab</strong>
            <div style={{
              fontFamily: tokens.mono, fontSize: 10,
              color: tokens.subtle, letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
            }}>Akademik</div>
          </div>
        </div>
        <CodeTag tone="slate">ONLINE QUIZ SYSTEM</CodeTag>
      </header>

      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '64px 40px',
        display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start',
      }}>
        {/* Hero */}
        <section>
          <Kicker>Akademik sınav platformu</Kicker>
          <h1 style={{
            margin: '12px 0 0', fontFamily: tokens.serif,
            fontSize: 56, fontWeight: 400, color: tokens.ink,
            letterSpacing: '-0.03em', lineHeight: 1.02,
          }}>
            Sınav, öğrenme<br/>ve değerlendirme<span style={{ color: tokens.indigo }}>.</span>
          </h1>
          <p style={{
            margin: '20px 0 0', maxWidth: 540, color: tokens.muted,
            fontSize: 17, lineHeight: 1.7,
          }}>
            Öğrenciler için odaklı sınav deneyimi, eğitmenler için kolay yönetim
            ve sonuç takibi. Tek bir akademik arayüzde.
          </p>

          <div style={{
            marginTop: 48,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          }}>
            {[
              {
                num: '01',
                title: 'Güvenli Giriş',
                desc: 'Akademik hesabınla doğrulanmış, hızlı ve güvenli oturum.',
                icon: ShieldCheck,
              },
              {
                num: '02',
                title: 'Öğrenci Akışı',
                desc: 'Sınavlara katıl, geçmiş sonuçlarını ve performansını gör.',
                icon: GraduationCap,
              },
              {
                num: '03',
                title: 'Eğitmen Akışı',
                desc: 'Soru bankası, sınav oluşturma ve detaylı istatistikler.',
                icon: BookOpen,
              },
            ].map(f => (
              <article key={f.num} style={{
                padding: 22, background: '#fff',
                border: `1px solid ${tokens.hairline}`, borderRadius: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{
                    fontFamily: tokens.mono, fontSize: 11,
                    color: tokens.indigo, letterSpacing: '0.08em', fontWeight: 600,
                  }}>{f.num}</span>
                  <span style={{ flex: 1, height: 1, background: tokens.hairlineSoft }} />
                  <f.icon size={16} style={{ color: tokens.indigo }} />
                </div>
                <h3 style={{
                  margin: '0 0 8px', fontFamily: tokens.serif,
                  fontSize: 19, fontWeight: 400, color: tokens.ink,
                  letterSpacing: '-0.01em',
                }}>{f.title}</h3>
                <p style={{
                  margin: 0, fontSize: 13, color: tokens.muted,
                  lineHeight: 1.6,
                }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Auth panel */}
        <aside style={{
          padding: 28, background: '#fff',
          border: `1px solid ${tokens.hairline}`, borderRadius: 16,
          position: 'sticky' as const, top: 24,
        }}>
          {!isAuthenticated ? (
            <>
              <Kicker>Hoş geldin</Kicker>
              <h2 style={{
                margin: '8px 0 0', fontFamily: tokens.serif,
                fontSize: 28, fontWeight: 400, color: tokens.ink,
                letterSpacing: '-0.02em', lineHeight: 1.15,
              }}>Devam etmek için<br/>giriş yap.</h2>
              <p style={{
                margin: '14px 0 0', color: tokens.muted,
                fontSize: 14, lineHeight: 1.6,
              }}>
                Akademik sınav platformuna hesabınla erişim sağla. Rolüne uygun panel otomatik açılır.
              </p>

              <Btn
                variant="primary"
                onClick={login}
                icon={<LogIn size={14} />}
                style={{
                  marginTop: 24, width: '100%',
                  justifyContent: 'center', padding: '14px 16px', fontSize: 14,
                }}
              >Giriş Yap</Btn>

              <div style={{
                marginTop: 18, padding: 12,
                background: tokens.ivory, border: `1px solid ${tokens.hairlineSoft}`,
                borderRadius: 10, fontSize: 12, color: tokens.subtle, lineHeight: 1.55,
              }}>
                Giriş sayfasına yönlendirileceksin. Doğrulama sonrası rolüne uygun panel otomatik açılır.
              </div>
            </>
          ) : (
            <>
              <Kicker>Oturum açık</Kicker>
              <h2 style={{
                margin: '8px 0 0', fontFamily: tokens.serif,
                fontSize: 26, fontWeight: 400, color: tokens.ink,
                letterSpacing: '-0.02em',
              }}>{user?.username ? `Merhaba, ${user.username}` : 'Hoş geldin'}<span style={{ color: tokens.indigo }}>.</span></h2>
              <p style={{
                margin: '14px 0 0', color: tokens.muted,
                fontSize: 14, lineHeight: 1.6,
              }}>Devam etmek istediğin paneli seç.</p>

              <div style={{ marginTop: 20, display: 'grid', gap: 8 }}>
                {hasRole('STUDENT') && (
                  <Link to="/student" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: '#fff', border: `1px solid ${tokens.hairline}`,
                    borderRadius: 12, textDecoration: 'none', color: tokens.ink,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <GraduationCap size={18} style={{ color: tokens.indigo }} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>Öğrenci Paneli</div>
                        <div style={{ fontSize: 12, color: tokens.subtle, marginTop: 2 }}>Sınavlarıma geç</div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: tokens.subtle }} />
                  </Link>
                )}
                {hasRole('INSTRUCTOR') && (
                  <Link to="/instructor" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: '#fff', border: `1px solid ${tokens.hairline}`,
                    borderRadius: 12, textDecoration: 'none', color: tokens.ink,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <BookOpen size={18} style={{ color: tokens.indigo }} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>Eğitmen Paneli</div>
                        <div style={{ fontSize: 12, color: tokens.subtle, marginTop: 2 }}>Sınavları yönet</div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: tokens.subtle }} />
                  </Link>
                )}
                {hasRole('ADMIN') && (
                  <Link to="/admin" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: '#fff', border: `1px solid ${tokens.hairline}`,
                    borderRadius: 12, textDecoration: 'none', color: tokens.ink,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ShieldCheck size={18} style={{ color: tokens.indigo }} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>Admin Paneli</div>
                        <div style={{ fontSize: 12, color: tokens.subtle, marginTop: 2 }}>Sistemi yönet</div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: tokens.subtle }} />
                  </Link>
                )}
              </div>

              <Btn
                onClick={logout}
                icon={<LogOut size={14} />}
                style={{
                  marginTop: 20, width: '100%',
                  justifyContent: 'center', padding: '12px 16px',
                }}
              >Çıkış Yap</Btn>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
