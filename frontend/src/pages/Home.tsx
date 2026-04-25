import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Sparkles, Trophy, ShieldCheck, Timer } from 'lucide-react';

const features = [
  { icon: Timer, title: 'Zamanlı Sınavlar', desc: 'Süre kontrollü modern quiz deneyimi.' },
  { icon: ShieldCheck, title: 'Güvenli Sistem', desc: 'Rol bazlı güvenli giriş altyapısı.' },
  { icon: Trophy, title: 'Başarı Takibi', desc: 'Performansını detaylı analiz et.' }
];

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
    background: '#f8fafc',
    color: '#0f172a',
    padding: '30px'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderRadius: '16px',
    background: '#ffffff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
  },
  hero: {
    marginTop: '60px',
    textAlign: 'center'
  },
  title: {
    fontSize: '56px',
    fontWeight: '900'
  },
  subtitle: {
    marginTop: '20px',
    fontSize: '18px',
    color: '#475569'
  },
  roles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '25px',
    marginTop: '40px'
  },
  studentCard: {
    padding: '40px',
    borderRadius: '20px',
    textDecoration: 'none',
    color: '#0f172a',
    background: '#ecfdf5',
    border: '1px solid #bbf7d0',
    boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
    transition: '0.3s'
  },
  instructorCard: {
    padding: '40px',
    borderRadius: '20px',
    textDecoration: 'none',
    color: '#0f172a',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
    transition: '0.3s'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginTop: '60px'
  },
  statBox: {
    textAlign: 'center'
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '25px',
    marginTop: '80px'
  },
  featureCard: {
    padding: '30px',
    borderRadius: '20px',
    background: '#ffffff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
  }
};

export default function Home() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen />
            <strong>QuizLab</strong>
          </div>
          <span style={{ color: '#64748b' }}>Yeni nesil sınav platformu</span>
        </div>

        <div style={styles.hero}>
          <div style={{ color: '#6366f1', marginBottom: '10px' }}>
            <Sparkles size={16} /> Modern Eğitim Teknolojisi
          </div>

          <h1 style={styles.title}>Online Quiz ve Sınav Sistemi</h1>

          <p style={styles.subtitle}>
            Öğrenciler ve eğitmenler için hızlı, sade ve güçlü sınav yönetim platformu.
          </p>

          <div style={styles.roles}>
            <Link to="/student" style={styles.studentCard}>
              <GraduationCap size={40} />
              <h2>Öğrenci Girişi</h2>
              <p>Sınavlara katıl, ilerlemeni gör</p>
            </Link>

            <Link to="/instructor" style={styles.instructorCard}>
              <BookOpen size={40} />
              <h2>Eğitmen Girişi</h2>
              <p>Sınav oluştur, yönet ve analiz et</p>
            </Link>
          </div>

          <div style={styles.stats}>
            <div style={styles.statBox}>
              <h2>10K+</h2>
              <p>Öğrenci</p>
            </div>
            <div style={styles.statBox}>
              <h2>500+</h2>
              <p>Sınav</p>
            </div>
            <div style={styles.statBox}>
              <h2>98%</h2>
              <p>Memnuniyet</p>
            </div>
          </div>
        </div>

        <div style={styles.featureGrid}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={styles.featureCard}>
                <Icon size={28} />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
