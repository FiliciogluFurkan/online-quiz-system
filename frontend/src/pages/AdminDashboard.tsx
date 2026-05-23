import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Layers,
  Search,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

type ActiveTab = 'exams' | 'questions' | 'submissions';

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
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexWrap: 'wrap' as const,
  },
  title: {
    margin: 0,
    fontSize: '42px',
    lineHeight: 1.08,
    letterSpacing: '-0.04em',
    fontWeight: 950,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  subtitle: {
    margin: '14px 0 0',
    maxWidth: '720px',
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.7,
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 950,
    background: '#ffffff',
    color: '#475569',
    border: '1px solid #e2e8f0',
    whiteSpace: 'nowrap' as const,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px',
    padding: '22px 30px 30px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '18px',
    borderRadius: '22px',
    background: '#ffffff',
    border: '1px solid #eef2f7',
    boxShadow: '0 12px 30px rgba(15,23,42,0.04)',
  },
  statIcon: {
    width: '46px',
    height: '46px',
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
    fontSize: '26px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap' as const,
    marginBottom: '18px',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontWeight: 900,
    fontSize: '14px',
    boxShadow: '0 10px 24px rgba(15,23,42,0.04)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: '270px',
    border: '1px solid #e2e8f0',
    background: 'rgba(255,255,255,0.92)',
    borderRadius: '16px',
    padding: '12px 14px',
    boxShadow: '0 10px 24px rgba(15,23,42,0.04)',
  },
  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#0f172a',
    fontWeight: 750,
  },
  panel: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    boxShadow: '0 24px 70px rgba(15,23,42,0.06)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '24px 26px',
    borderBottom: '1px solid #eef2f7',
    background: 'linear-gradient(135deg, rgba(248,250,252,0.95), rgba(239,246,255,0.68))',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
    fontSize: '22px',
    color: '#0f172a',
  },
  tableWrap: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    minWidth: '760px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '15px 18px',
    borderBottom: '1px solid #eef2f7',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 950,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    background: '#ffffff',
  },
  td: {
    padding: '16px 18px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px',
    color: '#334155',
    fontWeight: 700,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
    whiteSpace: 'nowrap' as const,
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  viewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    border: '1px solid #bfdbfe',
    borderRadius: '13px',
    padding: '9px 12px',
    cursor: 'pointer',
    color: '#1d4ed8',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
  },
  deleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    border: '1px solid #fecaca',
    borderRadius: '13px',
    padding: '9px 12px',
    cursor: 'pointer',
    color: '#dc2626',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #fff1f2, #ffffff)',
  },
  emptyState: {
    padding: '54px 24px',
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

function getStatusStyle(status: string) {
  if (status === 'GRADED') {
    return { background: '#ecfdf5', color: '#15803d', border: '1px solid #bbf7d0' };
  }
  if (status === 'SUBMITTED') {
    return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
  }
  return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
}

function formatDate(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('tr-TR');
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('exams');
  const {
    stats,
    exams,
    questions,
    studentExams,
    loading,
    search,
    setSearch,
    handleDeleteExam,
    handleDeleteQuestion,
    filteredExams,
    filteredQuestions,
    filteredStudentExams,
  } = useAdminDashboard();

  const tabs = [
    { key: 'exams' as const, label: 'Sınavlar', count: exams.length, icon: FileText },
    { key: 'questions' as const, label: 'Sorular', count: questions.length, icon: BookOpen },
    { key: 'submissions' as const, label: 'Katılımlar', count: studentExams.length, icon: BarChart3 },
  ];

  if (loading) return <div style={styles.loading}>Admin paneli yükleniyor...</div>;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.eyebrow}>
              <Sparkles size={16} />
              Yönetim merkezi
            </div>

            <div style={styles.titleRow}>
              <div>
                <h1 style={styles.title}>
                  <Shield size={40} color="#4f46e5" />
                  Admin Paneli
                </h1>
                <p style={styles.subtitle}>
                  Sınavları, soru havuzunu ve öğrenci katılımlarını tek ekrandan takip edin.
                </p>
              </div>

              <span style={styles.statusPill}>
                <CheckCircle2 size={16} color="#16a34a" />
                Sistem aktif
              </span>
            </div>
          </div>

          {stats && (
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: '#eff6ff', color: '#1d4ed8' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <p style={styles.statLabel}>Toplam Sınav</p>
                  <p style={styles.statValue}>{stats.totalExams}</p>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: '#f5f3ff', color: '#6d28d9' }}>
                  <BookOpen size={22} />
                </div>
                <div>
                  <p style={styles.statLabel}>Toplam Soru</p>
                  <p style={styles.statValue}>{stats.totalQuestions}</p>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: '#ecfdf5', color: '#15803d' }}>
                  <Users size={22} />
                </div>
                <div>
                  <p style={styles.statLabel}>Toplam Katılım</p>
                  <p style={styles.statValue}>{stats.totalStudentExams}</p>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: '#fffbeb', color: '#b45309' }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <p style={styles.statLabel}>Tamamlanan</p>
                  <p style={styles.statValue}>{stats.completedExams}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <div style={styles.toolbar}>
          <div style={styles.tabs}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Tab clicked:', tab.key);
                    setActiveTab(tab.key);
                  }}
                  style={{
                    ...styles.tabButton,
                    background: isActive ? '#4f46e5' : 'rgba(255,255,255,0.92)',
                    color: isActive ? '#ffffff' : '#64748b',
                    borderColor: isActive ? '#4f46e5' : '#e2e8f0',
                  }}
                >
                  <Icon size={17} />
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          <div style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Listede ara..."
              style={styles.searchInput}
            />
          </div>
        </div>

        {activeTab === 'exams' && (
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>
                <FileText size={24} color="#2563eb" />
                Tüm Sınavlar
              </h2>
              <span style={styles.statusPill}>
                <Layers size={15} />
                {filteredExams.length} kayıt
              </span>
            </div>

            {filteredExams.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <FileText size={34} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '22px' }}>Sınav bulunamadı</h3>
                <p style={{ margin: 0, color: '#64748b' }}>Arama kriterlerine uygun sınav yok.</p>
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Başlık</th>
                      <th style={styles.th}>Süre</th>
                      <th style={styles.th}>Durum</th>
                      <th style={styles.th}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map((exam) => (
                      <tr key={exam.id}>
                        <td style={styles.td}>#{exam.id}</td>
                        <td style={{ ...styles.td, color: '#0f172a', fontWeight: 900 }}>{exam.title}</td>
                        <td style={styles.td}>{exam.duration} dk</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              background: exam.published ? '#ecfdf5' : '#fffbeb',
                              color: exam.published ? '#15803d' : '#b45309',
                              border: exam.published ? '1px solid #bbf7d0' : '1px solid #fde68a',
                            }}
                          >
                            {exam.published ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                            {exam.published ? 'Yayında' : 'Taslak'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            <button
                              onClick={() => navigate(`/admin/exam/${exam.id}`)}
                              style={styles.viewBtn}
                            >
                              <Eye size={14} />
                              Görüntüle
                            </button>
                            <button onClick={() => handleDeleteExam(exam.id)} style={styles.deleteBtn}>
                              <Trash2 size={14} />
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'questions' && (
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>
                <BookOpen size={24} color="#6d28d9" />
                Tüm Sorular
              </h2>
              <span style={styles.statusPill}>
                <Layers size={15} />
                {filteredQuestions.length} kayıt
              </span>
            </div>

            {filteredQuestions.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <BookOpen size={34} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '22px' }}>Soru bulunamadı</h3>
                <p style={{ margin: 0, color: '#64748b' }}>Arama kriterlerine uygun soru yok.</p>
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Soru</th>
                      <th style={styles.th}>Tip</th>
                      <th style={styles.th}>Puan</th>
                      <th style={styles.th}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((question) => (
                      <tr key={question.id}>
                        <td style={styles.td}>#{question.id}</td>
                        <td style={{ ...styles.td, color: '#0f172a', fontWeight: 850 }}>
                          {question.questionText.length > 80
                            ? `${question.questionText.substring(0, 80)}...`
                            : question.questionText}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              background: '#f5f3ff',
                              color: '#6d28d9',
                              border: '1px solid #ddd6fe',
                            }}
                          >
                            {question.type}
                          </span>
                        </td>
                        <td style={styles.td}>{question.points}</td>
                        <td style={styles.td}>
                          <button onClick={() => handleDeleteQuestion(question.id)} style={styles.deleteBtn}>
                            <Trash2 size={14} />
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'submissions' && (
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>
                <BarChart3 size={24} color="#15803d" />
                Sınav Katılımları
              </h2>
              <span style={styles.statusPill}>
                <Layers size={15} />
                {filteredStudentExams.length} kayıt
              </span>
            </div>

            {filteredStudentExams.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <Users size={34} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '22px' }}>Katılım bulunamadı</h3>
                <p style={{ margin: 0, color: '#64748b' }}>Arama kriterlerine uygun katılım yok.</p>
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Sınav</th>
                      <th style={styles.th}>Kullanıcı ID</th>
                      <th style={styles.th}>Durum</th>
                      <th style={styles.th}>Puan</th>
                      <th style={styles.th}>Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudentExams.map((item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>#{item.id}</td>
                        <td style={{ ...styles.td, color: '#0f172a', fontWeight: 900 }}>
                          {item.exam?.title || '-'}
                        </td>
                        <td style={styles.td}>{item.keycloakUserId?.substring(0, 8)}...</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, ...getStatusStyle(item.status) }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={styles.td}>{item.score ?? '-'}</td>
                        <td style={styles.td}>{formatDate(item.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
