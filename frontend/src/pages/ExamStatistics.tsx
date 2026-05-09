import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';
import api from '../api/axios';

interface Question {
  id: number;
  questionText: string;
  points: number;
  type: string;
}

interface QuestionStat {
  question: Question;
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  successRate: number;
}

interface Statistics {
  totalParticipants: number;
  completedCount: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  questionStatistics: QuestionStat[];
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
    maxWidth: '1240px',
    margin: '0 auto',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    border: '1px solid #e2e8f0',
    background: 'rgba(255,255,255,0.86)',
    color: '#334155',
    padding: '12px 16px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 850,
    boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
  },
  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '9px 12px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 900,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#475569',
  },
  heroCard: {
    overflow: 'hidden',
    borderRadius: '30px',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 24px 70px rgba(15,23,42,0.075)',
    marginBottom: '24px',
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
    fontSize: '30px',
  },
  section: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 24px 70px rgba(15,23,42,0.06)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '24px 28px',
    borderBottom: '1px solid #eef2f7',
    background: 'linear-gradient(135deg, rgba(248,250,252,0.95), rgba(239,246,255,0.68))',
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
  questionList: {
    padding: '24px',
    display: 'grid',
    gap: '18px',
  },
  questionCard: {
    position: 'relative' as const,
    overflow: 'hidden',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '26px',
    padding: '22px',
    boxShadow: '0 16px 40px rgba(15,23,42,0.04)',
  },
  cardAccent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(90deg, rgba(99,102,241,0.65), rgba(14,165,233,0.45))',
  },
  questionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '18px',
    marginBottom: '18px',
    flexWrap: 'wrap' as const,
  },
  questionText: {
    margin: 0,
    color: '#0f172a',
    fontSize: '18px',
    lineHeight: 1.65,
    fontWeight: 900,
    flex: 1,
  },
  successBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 13px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 950,
    whiteSpace: 'nowrap' as const,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '18px',
  },
  miniStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    borderRadius: '18px',
    background: '#f8fafc',
    border: '1px solid #eef2f7',
  },
  miniIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '14px',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  miniValue: {
    margin: '0 0 2px',
    fontSize: '24px',
    fontWeight: 950,
    color: '#0f172a',
  },
  miniLabel: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 800,
  },
  progressWrapper: {
    display: 'grid',
    gap: '10px',
  },
  progressTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 850,
  },
  progressBar: {
    height: '12px',
    background: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.35s ease',
  },
  loading: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#f8fafc',
    color: '#64748b',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800,
  },
};

function getSuccessColor(rate: number) {
  if (rate >= 70) {
    return {
      bg: '#ecfdf5',
      color: '#15803d',
      border: '#bbf7d0',
      fill: '#16a34a',
      icon: CheckCircle2,
    };
  }

  if (rate >= 40) {
    return {
      bg: '#fffbeb',
      color: '#b45309',
      border: '#fde68a',
      fill: '#d97706',
      icon: AlertCircle,
    };
  }

  return {
    bg: '#fef2f2',
    color: '#dc2626',
    border: '#fecaca',
    fill: '#dc2626',
    icon: XCircle,
  };
}

export default function ExamStatistics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Statistics | null>(null);
  const [examTitle, setExamTitle] = useState('');

  useEffect(() => {
    loadStatistics();
  }, [id]);

  const loadStatistics = async () => {
    try {
      const examRes = await api.get(`/exams/${id}`);
      setExamTitle(examRes.data.title);

      const statsRes = await api.get(`/results/exam/${id}/statistics`);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      alert('İstatistikler yüklenirken hata oluştu!');
    }
  };

  const sortedQuestions = useMemo(() => {
    if (!stats) return [];

    return [...stats.questionStatistics].sort(
      (a, b) => a.successRate - b.successRate
    );
  }, [stats]);

  if (!stats) {
    return <div style={styles.loading}>İstatistikler yükleniyor...</div>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <button
            onClick={() => navigate(`/instructor/exam/${id}`)}
            style={styles.backButton}
          >
            <ArrowLeft size={18} />
            Sınava Dön
          </button>

          <span style={styles.topBadge}>
            <Shield size={15} />
            Analitik görünümü
          </span>
        </div>

        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.eyebrow}>
              <Sparkles size={16} />
              Performans analizi
            </div>

            <div style={styles.heroRow}>
              <div>
                <h1 style={styles.title}>Sınav İstatistikleri</h1>

                <p style={styles.subtitle}>
                  {examTitle} sınavına ait öğrenci performanslarını, başarı oranlarını ve soru bazlı analizleri görüntüleyin.
                </p>
              </div>

              <span style={styles.sectionBadge}>
                <BarChart3 size={15} />
                Gerçek zamanlı analiz
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
                <Users size={22} />
              </div>

              <div>
                <p style={styles.statLabel}>Tamamlayan Öğrenci</p>
                <p style={styles.statValue}>{stats.completedCount}</p>
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
                <Award size={22} />
              </div>

              <div>
                <p style={styles.statLabel}>Ortalama Puan</p>
                <p style={styles.statValue}>{stats.averageScore.toFixed(1)}</p>
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
                <TrendingUp size={22} />
              </div>

              <div>
                <p style={styles.statLabel}>En Yüksek Puan</p>
                <p style={styles.statValue}>{stats.maxScore.toFixed(0)}</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: '#fef2f2',
                  color: '#dc2626',
                }}
              >
                <TrendingDown size={22} />
              </div>

              <div>
                <p style={styles.statLabel}>En Düşük Puan</p>
                <p style={styles.statValue}>{stats.minScore.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <Target size={24} color="#2563eb" />
              Soru Bazlı Başarı Analizi
            </h2>

            <span style={styles.sectionBadge}>
              <Trophy size={14} />
              {sortedQuestions.length} soru analiz edildi
            </span>
          </div>

          <div style={styles.questionList}>
            {sortedQuestions.map((qStat, index) => {
              const colors = getSuccessColor(qStat.successRate);
              const StatusIcon = colors.icon;

              return (
                <article key={qStat.question.id} style={styles.questionCard}>
                  <div style={styles.cardAccent} />

                  <div style={styles.questionTop}>
                    <h3 style={styles.questionText}>
                      {index + 1}. {qStat.question.questionText}
                    </h3>

                    <span
                      style={{
                        ...styles.successBadge,
                        background: colors.bg,
                        color: colors.color,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <StatusIcon size={16} />
                      %{qStat.successRate.toFixed(0)} Başarı
                    </span>
                  </div>

                  <div style={styles.statsRow}>
                    <div style={styles.miniStat}>
                      <div
                        style={{
                          ...styles.miniIcon,
                          background: '#eff6ff',
                          color: '#2563eb',
                        }}
                      >
                        <Users size={18} />
                      </div>

                      <div>
                        <p style={styles.miniValue}>{qStat.totalAnswers}</p>
                        <p style={styles.miniLabel}>Toplam cevap</p>
                      </div>
                    </div>

                    <div style={styles.miniStat}>
                      <div
                        style={{
                          ...styles.miniIcon,
                          background: '#ecfdf5',
                          color: '#16a34a',
                        }}
                      >
                        <CheckCircle2 size={18} />
                      </div>

                      <div>
                        <p style={styles.miniValue}>{qStat.correctAnswers}</p>
                        <p style={styles.miniLabel}>Doğru cevap</p>
                      </div>
                    </div>

                    <div style={styles.miniStat}>
                      <div
                        style={{
                          ...styles.miniIcon,
                          background: '#fef2f2',
                          color: '#dc2626',
                        }}
                      >
                        <XCircle size={18} />
                      </div>

                      <div>
                        <p style={styles.miniValue}>{qStat.incorrectAnswers}</p>
                        <p style={styles.miniLabel}>Yanlış cevap</p>
                      </div>
                    </div>
                  </div>

                  <div style={styles.progressWrapper}>
                    <div style={styles.progressTop}>
                      <span>Başarı oranı</span>
                      <span>%{qStat.successRate.toFixed(1)}</span>
                    </div>

                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${qStat.successRate}%`,
                          background: colors.fill,
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
