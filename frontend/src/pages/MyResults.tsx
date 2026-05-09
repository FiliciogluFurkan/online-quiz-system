import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import api from '../api/axios';

interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number;
}

interface StudentExam {
  id: number;
  exam: Exam;
  score: number;
  status: string;
  startedAt: string;
  submittedAt: string;
}

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background:
      'radial-gradient(circle at 10% 8%, rgba(99,102,241,0.10), transparent 26%), radial-gradient(circle at 88% 12%, rgba(14,165,233,0.10), transparent 24%), #f8fafc',
    color: '#0f172a',
    padding: '32px',
    boxSizing: 'border-box' as const,
  },
  container: {
    maxWidth: '1180px',
    margin: '0 auto',
  },
  heroCard: {
    overflow: 'hidden',
    borderRadius: '30px',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 24px 70px rgba(15,23,42,0.075)',
    marginBottom: '26px',
  },
  heroTop: {
    padding: '30px',
    background: 'linear-gradient(135deg, rgba(238,242,255,0.95), rgba(240,249,255,0.9))',
    borderBottom: '1px solid #e2e8f0',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 13px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #c7d2fe',
    color: '#4f46e5',
    fontSize: '14px',
    fontWeight: 850,
    marginBottom: '16px',
  },
  heroRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexWrap: 'wrap' as const,
  },
  title: {
    margin: 0,
    fontSize: '44px',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
    fontWeight: 950,
    color: '#0f172a',
  },
  subtitle: {
    margin: '14px 0 0',
    maxWidth: '720px',
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.7,
  },
  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 13px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 950,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#475569',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px',
    padding: '24px 30px 30px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    borderRadius: '22px',
    background: '#ffffff',
    border: '1px solid #eef2f7',
    boxShadow: '0 12px 30px rgba(15,23,42,0.04)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  statLabel: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 850,
  },
  statValue: {
    margin: '4px 0 0',
    color: '#0f172a',
    fontWeight: 950,
    fontSize: '28px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '18px',
    flexWrap: 'wrap' as const,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
    fontSize: '24px',
    fontWeight: 950,
  },
  sectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 13px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 900,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '18px',
  },
  card: {
    position: 'relative' as const,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    padding: '22px',
    boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
    transition: 'all 0.18s ease',
  },
  cardAccent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(90deg, rgba(99,102,241,0.65), rgba(14,165,233,0.45))',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '16px',
  },
  iconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '18px',
    background: '#eef2ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid #c7d2fe',
  },
  scoreBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '999px',
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    fontSize: '14px',
    fontWeight: 900,
  },
  examTitle: {
    margin: 0,
    fontSize: '21px',
    lineHeight: 1.35,
    fontWeight: 950,
    color: '#0f172a',
  },
  description: {
    margin: '10px 0 18px',
    color: '#64748b',
    fontSize: '14px',
    lineHeight: 1.7,
  },
  metaGrid: {
    display: 'grid',
    gap: '10px',
    marginBottom: '18px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 13px',
    borderRadius: '16px',
    background: '#f8fafc',
    border: '1px solid #eef2f7',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 800,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap' as const,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900,
  },
  viewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 15px',
    borderRadius: '16px',
    border: '1px solid #bfdbfe',
    background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
    color: '#2563eb',
    fontSize: '14px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  empty: {
    padding: '60px 24px',
    textAlign: 'center' as const,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
  },
  emptyIcon: {
    width: '78px',
    height: '78px',
    borderRadius: '26px',
    background: '#eef2ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 18px',
  },
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('tr-TR');
}

export default function MyResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState<StudentExam[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const res = await api.get('/results/my-results');
      // Sadece tamamlanmış sınavları göster (SUBMITTED veya GRADED)
      const completedResults = res.data.filter(
        (r: StudentExam) => r.status === 'GRADED' || r.status === 'SUBMITTED'
      );
      setResults(completedResults);
    } catch (error) {
      console.error('Error loading results:', error);
      alert('Sonuçlar yüklenirken hata oluştu!');
    }
  };

  const completedResults = useMemo(() => {
    return results.filter((r) => r.status === 'GRADED');
  }, [results]);

  const totalScore = useMemo(() => {
    return completedResults.reduce((sum, r) => sum + r.score, 0);
  }, [completedResults]);

  const averageScore = useMemo(() => {
    return completedResults.length > 0
      ? totalScore / completedResults.length
      : 0;
  }, [completedResults, totalScore]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.eyebrow}>
              <Sparkles size={16} />
              Öğrenci paneli
            </div>

            <div style={styles.heroRow}>
              <div>
                <h1 style={styles.title}>Sınav Geçmişim</h1>

                <p style={styles.subtitle}>
                  Tamamladığın sınavları, puanlarını ve detaylı sonuçlarını tek ekrandan takip edebilirsin.
                </p>
              </div>

              <span style={styles.topBadge}>
                <Shield size={15} />
                Sonuç merkezi
              </span>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: '#eef2ff',
                  color: '#4f46e5',
                }}
              >
                <FileText size={22} />
              </div>

              <div>
                <p style={styles.statLabel}>Toplam Sınav</p>
                <p style={styles.statValue}>{results.length}</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: '#ecfdf5',
                  color: '#16a34a',
                }}
              >
                <CheckCircle2 size={22} />
              </div>

              <div>
                <p style={styles.statLabel}>Tamamlanan</p>
                <p style={styles.statValue}>{completedResults.length}</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: '#fff7ed',
                  color: '#c2410c',
                }}
              >
                <Trophy size={22} />
              </div>

              <div>
                <p style={styles.statLabel}>Toplam Puan</p>
                <p style={styles.statValue}>{totalScore.toFixed(0)}</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: '#f5f3ff',
                  color: '#7c3aed',
                }}
              >
                <TrendingUp size={22} />
              </div>

              <div>
                <p style={styles.statLabel}>Ortalama</p>
                <p style={styles.statValue}>{averageScore.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </section>

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <Award size={24} color="#2563eb" />
            Sınav Sonuçlarım
          </h2>

          <span style={styles.sectionBadge}>
            <Star size={14} />
            {results.length} sonuç bulundu
          </span>
        </div>

        {results.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <FileText size={38} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 950 }}>
              Henüz sınav yok
            </h3>

            <p
              style={{
                margin: 0,
                color: '#64748b',
                lineHeight: 1.7,
                maxWidth: '520px',
                marginInline: 'auto',
              }}
            >
              İlk sınavını tamamladığında sonuçların ve performans detayların burada görüntülenecek.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {results.map((result) => (
              <article key={result.id} style={styles.card}>
                <div style={styles.cardAccent} />

                <div style={styles.cardHeader}>
                  <div style={styles.iconBox}>
                    <FileText size={24} />
                  </div>

                  <span style={styles.scoreBadge}>
                    <Trophy size={14} />
                    {result.score} puan
                  </span>
                </div>

                <h3 style={styles.examTitle}>{result.exam.title}</h3>

                <p style={styles.description}>
                  {result.exam.description || 'Bu sınav için açıklama bulunmuyor.'}
                </p>

                <div style={styles.metaGrid}>
                  <div style={styles.metaItem}>
                    <Clock3 size={16} />
                    Süre: {result.exam.duration} dakika
                  </div>

                  <div style={styles.metaItem}>
                    <Calendar size={16} />
                    Teslim: {result.submittedAt ? formatDate(result.submittedAt) : 'Henüz teslim edilmedi'}
                  </div>
                </div>

                <div style={styles.footer}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background:
                        result.status === 'GRADED' ? '#ecfdf5' : '#eff6ff',
                      color:
                        result.status === 'GRADED' ? '#15803d' : '#2563eb',
                      border:
                        result.status === 'GRADED'
                          ? '1px solid #bbf7d0'
                          : '1px solid #bfdbfe',
                    }}
                  >
                    <CheckCircle2 size={14} />
                    {result.status === 'GRADED'
                      ? 'Puanlandı'
                      : 'Teslim Edildi'}
                  </span>

                  <button
                    onClick={() => navigate(`/student/result/${result.id}`)}
                    style={styles.viewButton}
                  >
                    Detayları Gör
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
