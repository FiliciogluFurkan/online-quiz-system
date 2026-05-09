import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Search,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import type { Exam } from '../types';

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(99,102,241,0.035), transparent 28%), #f8fafc',
    padding: '36px 24px',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
    color: '#0f172a',
  },
  container: {
    maxWidth: '1080px',
    margin: '0 auto',
  },
  hero: {
    background: '#ffffff',
    border: '1px solid #edf2f7',
    borderRadius: '26px',
    padding: '26px',
    marginBottom: '22px',
    boxShadow: '0 18px 50px rgba(15,23,42,0.045)',
  },
  heroTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'flex-start',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 12px',
    borderRadius: '999px',
    background: '#f8fafc',
    border: '1px solid #e8edf5',
    color: '#6366f1',
    fontSize: '13px',
    fontWeight: 800,
    marginBottom: '14px',
  },
  title: {
    margin: 0,
    fontSize: '38px',
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
    fontWeight: 950,
  },
  subtitle: {
    margin: '10px 0 0',
    maxWidth: '620px',
    color: '#64748b',
    fontSize: '15px',
    lineHeight: 1.7,
  },
  statBox: {
    minWidth: '170px',
    background: '#fbfdff',
    border: '1px solid #edf2f7',
    borderRadius: '20px',
    padding: '16px',
  },
  statLabel: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: 800,
  },
  statValue: {
    margin: '5px 0 0',
    fontSize: '30px',
    fontWeight: 950,
  },
  toolbar: {
    marginTop: '22px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  searchBox: {
    flex: 1,
    minWidth: '260px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f8fafc',
    border: '1px solid #e8edf5',
    borderRadius: '16px',
    padding: '12px 14px',
    color: '#94a3b8',
  },
  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#0f172a',
    fontSize: '14px',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 13px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #e8edf5',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 800,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 14px',
    fontSize: '21px',
    fontWeight: 900,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
    gap: '16px',
  },
  card: {
    position: 'relative' as const,
    overflow: 'hidden',
    background: '#ffffff',
    border: '1px solid #edf2f7',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 14px 38px rgba(15,23,42,0.035)',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  cardAccent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background:
      'linear-gradient(90deg, rgba(99,102,241,0.45), rgba(14,165,233,0.28))',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '14px',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    background: '#f5f7ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid #e8edff',
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#f6fef9',
    color: '#15803d',
    border: '1px solid #dcfce7',
    fontSize: '12px',
    fontWeight: 850,
  },
  examTitle: {
    margin: 0,
    fontSize: '19px',
    lineHeight: 1.35,
    fontWeight: 900,
  },
  description: {
    margin: '9px 0 16px',
    color: '#64748b',
    fontSize: '14px',
    lineHeight: 1.65,
  },
  metaGrid: {
    display: 'grid',
    gap: '9px',
    marginBottom: '17px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '10px 11px',
    borderRadius: '14px',
    background: '#f8fafc',
    border: '1px solid #f1f5f9',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 750,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingTop: '14px',
    borderTop: '1px solid #f1f5f9',
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 750,
  },
  startButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px 14px',
    borderRadius: '14px',
    border: '1px solid #dbeafe',
    background: '#f8fbff',
    color: '#2563eb',
    fontSize: '14px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  empty: {
    padding: '58px 24px',
    textAlign: 'center' as const,
    background: '#ffffff',
    border: '1px solid #edf2f7',
    borderRadius: '24px',
    boxShadow: '0 14px 38px rgba(15,23,42,0.035)',
  },
  emptyIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '24px',
    background: '#f5f7ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 16px',
  },
};

function formatDate(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleString('tr-TR');
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState('');
  const [completedExams, setCompletedExams] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadExams();
  }, [location.search]); // URL query parametresi değiştiğinde yenile

  const loadExams = async () => {
    try {
      console.log('🔄 Loading exams...');
      // Öğrenciler için sadece yayınlanmış sınavları getir
      const examsRes = await api.get('/exams/published');
      console.log('📚 Exams loaded:', examsRes.data);
      setExams(examsRes.data);
      
      // Backend'den tamamlanan sınavları kontrol et (Keycloak user ID ile)
      const completed = new Set<number>();
      
      for (const exam of examsRes.data) {
        try {
          console.log(`🔍 Checking exam ${exam.id} status...`);
          const statusRes = await api.get(`/student-exams/check/${exam.id}`);
          console.log(`📊 Exam ${exam.id} response:`, statusRes.data);
          
          // Backend null dönebilir, kontrol et
          if (statusRes.data !== null && statusRes.data.status && 
              ['SUBMITTED', 'GRADED'].includes(statusRes.data.status)) {
            console.log(`✅ Exam ${exam.id} is completed!`);
            completed.add(exam.id);
          } else {
            console.log(`⏳ Exam ${exam.id} status:`, statusRes.data?.status || 'null response');
          }
        } catch (err) {
          console.log(`❌ No record for exam ${exam.id}`, err);
        }
      }
      
      console.log('✨ Completed exams:', Array.from(completed));
      setCompletedExams(completed);
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const filteredExams = exams.filter((exam) =>
    `${exam.title} ${exam.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.heroTop}>
            <div>
              <div style={styles.eyebrow}>
                <Sparkles size={15} />
                Öğrenci alanı
              </div>

              <h1 style={styles.title}>Sınavlarım</h1>

              <p style={styles.subtitle}>
                Yayındaki sınavları görüntüleyebilir, süre ve tarih bilgilerini
                kontrol ederek sınava başlayabilirsin.
              </p>
            </div>

            <div style={styles.statBox}>
              <p style={styles.statLabel}>Aktif sınav</p>
              <p style={styles.statValue}>{exams.length}</p>
            </div>
          </div>

          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sınav ara..."
                style={styles.searchInput}
              />
            </div>

            <button
              onClick={() => navigate('/student/my-results')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '999px',
                background: '#ffffff',
                border: '1px solid #e8edf5',
                color: '#4f46e5',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Clock3 size={16} />
              Geçmiş Sınavlarım
            </button>

            <span style={styles.pill}>
              <BookOpenCheck size={16} />
              {filteredExams.length} sınav listeleniyor
            </span>
          </div>
        </section>

        <h2 style={styles.sectionTitle}>
          <FileText size={22} color="#2563eb" />
          Mevcut Sınavlar
        </h2>

        {filteredExams.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <GraduationCap size={36} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '21px' }}>
              Sınav bulunamadı
            </h3>
            <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>
              Şu anda kriterlere uygun aktif bir sınav bulunmuyor.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredExams.map((exam) => {
              const isCompleted = completedExams.has(exam.id);
              
              return (
              <article key={exam.id} style={styles.card}>
                <div style={styles.cardAccent} />

                <div style={styles.cardHeader}>
                  <div style={styles.iconBox}>
                    <FileText size={23} />
                  </div>

                  <span style={{
                    ...styles.status,
                    background: isCompleted ? '#ecfdf5' : '#eff6ff',
                    color: isCompleted ? '#15803d' : '#1d4ed8',
                    border: isCompleted ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
                  }}>
                    <CheckCircle2 size={14} />
                    {isCompleted ? 'Tamamlandı' : 'Yayında'}
                  </span>
                </div>

                <h3 style={styles.examTitle}>{exam.title}</h3>

                <p style={styles.description}>
                  {exam.description || 'Bu sınav için açıklama eklenmemiş.'}
                </p>

                <div style={styles.metaGrid}>
                  <div style={styles.metaItem}>
                    <Clock3 size={16} />
                    Süre: {exam.duration} dakika
                  </div>

                  {exam.startTime && (
                    <div style={styles.metaItem}>
                      <CalendarClock size={16} />
                      Başlangıç: {formatDate(exam.startTime)}
                    </div>
                  )}

                  {exam.endTime && (
                    <div style={styles.metaItem}>
                      <CalendarClock size={16} />
                      Bitiş: {formatDate(exam.endTime)}
                    </div>
                  )}
                </div>

                <div style={styles.footer}>
                  <div style={styles.hint}>
                    <Clock3 size={14} />
                    {isCompleted ? 'Sınav tamamlandı' : 'Hazır olduğunda başla'}
                  </div>

                  <button
                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                    disabled={isCompleted}
                    style={{
                      ...styles.startButton,
                      opacity: isCompleted ? 0.5 : 1,
                      cursor: isCompleted ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isCompleted ? 'Tamamlandı' : 'Başla'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            );
            })}
          </div>
        )}
      </div>
    </main>
  );
}