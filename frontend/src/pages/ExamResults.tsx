import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  GraduationCap,
  PlayCircle,
  Sparkles,
  Trophy,
  Users,
  Edit3,
} from 'lucide-react';
import api from '../api/axios';

interface StudentExam {
  id: number;
  status: string;
  score: number | null;
  startedAt: string;
  submittedAt: string | null;
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background:
      'radial-gradient(circle at 10% 8%, rgba(99,102,241,0.10), transparent 26%), radial-gradient(circle at 88% 12%, rgba(14,165,233,0.10), transparent 24%), #f8fafc',
    color: '#0f172a',
    padding: '32px',
    boxSizing: 'border-box',
  },
  container: {
    maxWidth: '1180px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '18px',
    marginBottom: '24px',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '999px',
    background: '#eef2ff',
    border: '1px solid #c7d2fe',
    color: '#4f46e5',
    fontSize: '13px',
    fontWeight: 900,
    marginBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '42px',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
    fontWeight: 950,
  },
  subtitle: {
    margin: '10px 0 0',
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.65,
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '15px',
    padding: '13px 16px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#475569',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '22px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 18px 45px rgba(15,23,42,0.055)',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '15px',
    display: 'grid',
    placeItems: 'center',
    marginBottom: '14px',
  },
  statValue: {
    margin: 0,
    fontSize: '34px',
    fontWeight: 950,
    letterSpacing: '-0.035em',
  },
  statLabel: {
    margin: '4px 0 0',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 800,
  },
  panel: {
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    boxShadow: '0 24px 70px rgba(15,23,42,0.065)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '24px 26px',
    borderBottom: '1px solid #eef2f7',
    background: 'linear-gradient(135deg, rgba(248,250,252,0.96), rgba(239,246,255,0.75))',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
    fontSize: '22px',
  },
  panelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 11px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 850,
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '860px',
  },
  th: {
    padding: '15px 18px',
    textAlign: 'left' as const,
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 950,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '17px 18px',
    borderBottom: '1px solid #eef2f7',
    color: '#334155',
    fontSize: '14px',
  },
  studentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    fontWeight: 900,
    color: '#0f172a',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '14px',
    background: '#eef2ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
    whiteSpace: 'nowrap' as const,
  },
  score: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '54px',
    padding: '8px 10px',
    borderRadius: '13px',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: 950,
    fontSize: '16px',
  },
  muted: {
    color: '#94a3b8',
  },
  detailButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    borderRadius: '13px',
    padding: '9px 12px',
    border: '1px solid #bfdbfe',
    background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
    color: '#1d4ed8',
    fontWeight: 900,
    cursor: 'pointer',
    marginRight: '8px',
  },
  gradeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    borderRadius: '13px',
    padding: '9px 12px',
    border: '1px solid #fde68a',
    background: 'linear-gradient(135deg, #fffbeb, #ffffff)',
    color: '#d97706',
    fontWeight: 900,
    cursor: 'pointer',
  },
  emptyState: {
    padding: '58px 24px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    width: '76px',
    height: '76px',
    borderRadius: '25px',
    background: '#eef2ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 18px',
  },
};

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('tr-TR');
}

function getStatusMeta(status: string) {
  const stylesMap: Record<string, any> = {
    IN_PROGRESS: {
      bg: '#fff7ed',
      color: '#c2410c',
      border: '#fed7aa',
      text: 'Devam Ediyor',
      icon: PlayCircle,
    },
    SUBMITTED: {
      bg: '#eff6ff',
      color: '#1d4ed8',
      border: '#bfdbfe',
      text: 'Teslim Edildi',
      icon: FileText,
    },
    GRADED: {
      bg: '#ecfdf5',
      color: '#15803d',
      border: '#bbf7d0',
      text: 'Puanlandı',
      icon: CheckCircle2,
    },
    NOT_STARTED: {
      bg: '#f8fafc',
      color: '#64748b',
      border: '#e2e8f0',
      text: 'Başlamadı',
      icon: Clock3,
    },
  };

  return stylesMap[status] || stylesMap.NOT_STARTED;
}

export default function ExamResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<StudentExam[]>([]);
  const [examTitle, setExamTitle] = useState('');

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      const examRes = await api.get(`/exams/${id}`);
      setExamTitle(examRes.data.title);

      const resultsRes = await api.get(`/results/exam/${id}`);
      setResults(resultsRes.data);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const completedResults = results.filter((r) => r.status === 'GRADED' || r.status === 'SUBMITTED');
  const averageScore = completedResults.length > 0
    ? completedResults.reduce((sum, r) => sum + (r.score || 0), 0) / completedResults.length
    : 0;

  const stats = useMemo(() => [
    {
      label: 'Toplam Katılımcı',
      value: results.length,
      icon: Users,
      bg: '#eef2ff',
      color: '#4f46e5',
    },
    {
      label: 'Tamamlanan',
      value: completedResults.length,
      icon: CheckCircle2,
      bg: '#ecfdf5',
      color: '#16a34a',
    },
    {
      label: 'Ortalama Puan',
      value: averageScore.toFixed(1),
      icon: Trophy,
      bg: '#f5f3ff',
      color: '#7c3aed',
    },
    {
      label: 'Devam Eden',
      value: results.filter((r) => r.status === 'IN_PROGRESS').length,
      icon: PlayCircle,
      bg: '#fff7ed',
      color: '#c2410c',
    },
  ], [results, completedResults.length, averageScore]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              <Sparkles size={15} />
              Sınav performans raporu
            </div>
            <h1 style={styles.title}>Sınav Sonuçları</h1>
            <p style={styles.subtitle}>{examTitle || 'Sınav bilgisi yükleniyor...'}</p>
          </div>

          <button onClick={() => navigate(`/instructor/exam/${id}`)} style={styles.backButton}>
            <ArrowLeft size={17} />
            Sınava Dön
          </button>
        </header>

        <section style={styles.statsGrid}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: stat.bg, color: stat.color }}>
                  <Icon size={23} />
                </div>
                <h2 style={styles.statValue}>{stat.value}</h2>
                <p style={styles.statLabel}>{stat.label}</p>
              </article>
            );
          })}
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>
              <BarChart3 size={24} color="#2563eb" />
              Öğrenci Sonuçları
            </h2>
            <span style={styles.panelBadge}>
              <GraduationCap size={15} />
              {results.length} kayıt
            </span>
          </div>

          {results.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <Users size={36} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '22px' }}>Henüz sonuç yok</h3>
              <p style={{ margin: '0 auto', maxWidth: '440px', color: '#64748b', lineHeight: 1.6 }}>
                Bu sınava henüz hiçbir öğrenci katılmadı. Katılımlar başladığında sonuçlar burada görünecek.
              </p>
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Öğrenci</th>
                    <th style={styles.th}>Durum</th>
                    <th style={styles.th}>Puan</th>
                    <th style={styles.th}>Başlangıç</th>
                    <th style={styles.th}>Teslim</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => {
                    const status = getStatusMeta(result.status);
                    const StatusIcon = status.icon;
                    const canViewDetail = result.status === 'GRADED' || result.status === 'SUBMITTED';

                    return (
                      <tr key={result.id}>
                        <td style={styles.td}>
                          <div style={styles.studentCell}>
                            <div style={styles.avatar}>{index + 1}</div>
                            Öğrenci #{result.id}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              background: status.bg,
                              color: status.color,
                              border: `1px solid ${status.border}`,
                            }}
                          >
                            <StatusIcon size={14} />
                            {status.text}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {result.score !== null ? (
                            <span style={styles.score}>{result.score}</span>
                          ) : (
                            <span style={styles.muted}>-</span>
                          )}
                        </td>
                        <td style={styles.td}>{formatDate(result.startedAt)}</td>
                        <td style={styles.td}>{formatDate(result.submittedAt)}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          {canViewDetail ? (
                            <>
                              <button onClick={() => navigate(`/instructor/result/${result.id}`)} style={styles.detailButton}>
                                <Eye size={15} />
                                Detay
                              </button>
                              <button onClick={() => navigate(`/instructor/grade/${result.id}`)} style={styles.gradeButton}>
                                <Edit3 size={15} />
                                Manuel Puanla
                              </button>
                            </>
                          ) : (
                            <span style={styles.muted}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
