import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background:
      'radial-gradient(circle at 12% 8%, rgba(99,102,241,0.10), transparent 26%), radial-gradient(circle at 88% 12%, rgba(14,165,233,0.10), transparent 24%), #f8fafc',
    color: '#0f172a',
    padding: '32px',
    boxSizing: 'border-box',
  },
  container: {
    maxWidth: '1120px',
    margin: '0 auto',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '18px 20px',
    borderRadius: '22px',
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 16px 40px rgba(15,23,42,0.055)',
    marginBottom: '46px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '16px',
    display: 'grid',
    placeItems: 'center',
    background: '#eef2ff',
    color: '#4f46e5',
    border: '1px solid #c7d2fe',
  },
  navText: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 800,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 390px',
    gap: '28px',
    alignItems: 'stretch',
  },
  heroCard: {
    padding: '44px',
    borderRadius: '32px',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 28px 80px rgba(15,23,42,0.075)',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 13px',
    borderRadius: '999px',
    background: '#eef2ff',
    border: '1px solid #c7d2fe',
    color: '#4f46e5',
    fontSize: '14px',
    fontWeight: 900,
    marginBottom: '18px',
  },
  title: {
    margin: 0,
    fontSize: '56px',
    lineHeight: 1.02,
    letterSpacing: '-0.055em',
    fontWeight: 950,
    color: '#0f172a',
  },
  subtitle: {
    maxWidth: '650px',
    margin: '20px 0 0',
    color: '#64748b',
    fontSize: '18px',
    lineHeight: 1.75,
  },
  authPanel: {
    padding: '26px',
    borderRadius: '32px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(239,246,255,0.82))',
    border: '1px solid #e2e8f0',
    boxShadow: '0 28px 80px rgba(15,23,42,0.075)',
  },
  userBox: {
    padding: '22px',
    borderRadius: '26px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
    boxShadow: '0 14px 34px rgba(15,23,42,0.045)',
  },
  avatar: {
    width: '58px',
    height: '58px',
    borderRadius: '20px',
    display: 'grid',
    placeItems: 'center',
    background: '#eef2ff',
    color: '#4f46e5',
    border: '1px solid #c7d2fe',
    marginBottom: '14px',
  },
  primaryButton: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    borderRadius: '16px',
    padding: '15px 18px',
    border: '1px solid #bfdbfe',
    background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
    color: '#1d4ed8',
    fontWeight: 950,
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 16px 34px rgba(37,99,235,0.10)',
  },
  logoutButton: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    borderRadius: '16px',
    padding: '14px 18px',
    border: '1px solid #fecaca',
    background: 'linear-gradient(135deg, #fef2f2, #ffffff)',
    color: '#b91c1c',
    fontWeight: 950,
    cursor: 'pointer',
    marginTop: '14px',
  },
  roleGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
  },
  roleCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    padding: '18px',
    borderRadius: '22px',
    textDecoration: 'none',
    color: '#0f172a',
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 16px 34px rgba(15,23,42,0.06)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
  },
  roleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
  },
  roleIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '16px',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px',
    marginTop: '26px',
  },
  featureCard: {
    padding: '20px',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.88)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 16px 40px rgba(15,23,42,0.045)',
  },
};

const cardEvents = {
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(-3px)';
    e.currentTarget.style.boxShadow = '0 22px 44px rgba(15,23,42,0.10)';
    e.currentTarget.style.borderColor = '#c7d2fe';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 16px 34px rgba(15,23,42,0.06)';
    e.currentTarget.style.borderColor = '#e2e8f0';
  },
};

export default function Home() {
  const { isAuthenticated, user, login, logout, hasRole } = useAuth();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>
              <BookOpen size={23} />
            </div>
            <div>
              <strong style={{ fontSize: '20px' }}>QuizLab</strong>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
                Online sınav sistemi
              </div>
            </div>
          </div>

          <span style={styles.navText}>Modern eğitim platformu</span>
        </nav>

        <section style={styles.hero}>
          <div style={styles.heroCard}>
            <div style={styles.eyebrow}>
              <Sparkles size={16} />
              Akıllı ve sade sınav deneyimi
            </div>

            <h1 style={styles.title}>Online Quiz ve Sınav Sistemi</h1>

            <p style={styles.subtitle}>
              Öğrenciler için odaklı sınav deneyimi, eğitmenler için kolay yönetim ve sonuç
              takibi. Devam etmek için hesabınla giriş yap.
            </p>

            <div style={styles.featureGrid}>
              <div style={styles.featureCard}>
                <ShieldCheck size={24} color="#4f46e5" />
                <h3 style={{ margin: '12px 0 6px' }}>Güvenli Giriş</h3>
                <p style={{ margin: 0, color: '#64748b', lineHeight: 1.55 }}>
                  Güvenli oturum sistemi ile hesabınıza kolayca erişin.
                </p>
              </div>

              <div style={styles.featureCard}>
                <GraduationCap size={24} color="#0284c7" />
                <h3 style={{ margin: '12px 0 6px' }}>Öğrenci Paneli</h3>
                <p style={{ margin: 0, color: '#64748b', lineHeight: 1.55 }}>
                  Sınavlara katılın ve performansınızı takip edin.
                </p>
              </div>

              <div style={styles.featureCard}>
                <BookOpen size={24} color="#16a34a" />
                <h3 style={{ margin: '12px 0 6px' }}>Eğitmen Paneli</h3>
                <p style={{ margin: 0, color: '#64748b', lineHeight: 1.55 }}>
                  Sınav oluşturun, soruları ve sonuçları yönetin.
                </p>
              </div>
            </div>
          </div>

          <aside style={styles.authPanel}>
            {!isAuthenticated ? (
              <>
                <div style={styles.userBox}>
                  <div style={styles.avatar}>
                    <LogIn size={27} />
                  </div>

                  <h2 style={{ margin: '0 0 8px', fontSize: '25px' }}>Hoş geldiniz</h2>

                  <p style={{ margin: 0, color: '#64748b', lineHeight: 1.65 }}>
                    Platforma devam etmek için hesabınızla giriş yapın.
                  </p>
                </div>

                <button onClick={login} style={styles.primaryButton}>
                  <LogIn size={18} />
                  Giriş Yap
                </button>
              </>
            ) : (
              <>
                <div style={styles.userBox}>
                  <div style={styles.avatar}>
                    <UserRound size={28} />
                  </div>

                  <h2 style={{ margin: '0 0 6px', fontSize: '25px' }}>
                    Hoş geldiniz, {user?.username}
                  </h2>

                  <p style={{ margin: 0, color: '#64748b', lineHeight: 1.65 }}>
                    Devam etmek istediğiniz paneli seçin.
                  </p>
                </div>

                <div style={styles.roleGrid}>
                  {hasRole('STUDENT') && (
                    <Link to="/student" style={styles.roleCard} {...cardEvents}>
                      <div style={styles.roleLeft}>
                        <div
                          style={{
                            ...styles.roleIcon,
                            background: '#f0f9ff',
                            color: '#0284c7',
                            border: '1px solid #bae6fd',
                          }}
                        >
                          <GraduationCap size={22} />
                        </div>

                        <div>
                          <strong>Öğrenci Paneli</strong>
                          <div style={{ color: '#64748b', fontSize: '13px', marginTop: '3px' }}>
                            Sınavlarına geç
                          </div>
                        </div>
                      </div>

                      <ArrowRight size={18} color="#94a3b8" />
                    </Link>
                  )}

                  {hasRole('INSTRUCTOR') && (
                    <Link to="/instructor" style={styles.roleCard} {...cardEvents}>
                      <div style={styles.roleLeft}>
                        <div
                          style={{
                            ...styles.roleIcon,
                            background: '#ecfdf5',
                            color: '#16a34a',
                            border: '1px solid #bbf7d0',
                          }}
                        >
                          <BookOpen size={22} />
                        </div>

                        <div>
                          <strong>Eğitmen Paneli</strong>
                          <div style={{ color: '#64748b', fontSize: '13px', marginTop: '3px' }}>
                            Sınavları yönet
                          </div>
                        </div>
                      </div>

                      <ArrowRight size={18} color="#94a3b8" />
                    </Link>
                  )}

                  {hasRole('ADMIN') && (
                    <Link to="/admin" style={styles.roleCard} {...cardEvents}>
                      <div style={styles.roleLeft}>
                        <div
                          style={{
                            ...styles.roleIcon,
                            background: '#fef3c7',
                            color: '#d97706',
                            border: '1px solid #fde68a',
                          }}
                        >
                          <ShieldCheck size={22} />
                        </div>

                        <div>
                          <strong>Admin Paneli</strong>
                          <div style={{ color: '#64748b', fontSize: '13px', marginTop: '3px' }}>
                            Sistemi yönet
                          </div>
                        </div>
                      </div>

                      <ArrowRight size={18} color="#94a3b8" />
                    </Link>
                  )}
                </div>

                <button onClick={logout} style={styles.logoutButton}>
                  <LogOut size={18} />
                  Çıkış Yap
                </button>
              </>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}