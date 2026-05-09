import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileQuestion,
  FileText,
  Layers,
  Shield,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import type { Exam, Question } from '../types';

interface ExamQuestion {
  id: number;
  question: Question;
  orderIndex: number;
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
    maxWidth: '1120px',
    margin: '0 auto',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '24px',
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
    padding: '28px',
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
  },
  description: {
    margin: '14px 0 0',
    maxWidth: '720px',
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.7,
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 13px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 950,
    whiteSpace: 'nowrap' as const,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    padding: '22px 28px 26px',
  },
  metaCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    padding: '17px',
    borderRadius: '20px',
    background: '#ffffff',
    border: '1px solid #eef2f7',
    boxShadow: '0 12px 30px rgba(15,23,42,0.035)',
  },
  metaIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '15px',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  metaLabel: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 850,
  },
  metaValue: {
    margin: '3px 0 0',
    color: '#0f172a',
    fontWeight: 900,
    fontSize: '15px',
  },
  questionsPanel: {
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
  questionList: {
    padding: '22px',
    display: 'grid',
    gap: '14px',
  },
  questionCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '22px',
    padding: '20px',
    boxShadow: '0 12px 30px rgba(15,23,42,0.04)',
  },
  questionTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '13px',
    flexWrap: 'wrap' as const,
  },
  tags: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900,
  },
  questionText: {
    margin: 0,
    color: '#0f172a',
    fontSize: '16px',
    lineHeight: 1.65,
    fontWeight: 850,
  },
  optionsBox: {
    margin: '14px 0 0',
    padding: '14px',
    borderRadius: '16px',
    background: '#f8fafc',
    border: '1px solid #eef2f7',
    color: '#475569',
    fontSize: '13px',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  answerBox: {
    marginTop: '12px',
    padding: '12px 14px',
    borderRadius: '16px',
    background: '#ecfdf5',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    fontSize: '14px',
    fontWeight: 900,
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

function getQuestionTypeLabel(type: string) {
  if (type === 'MULTIPLE_CHOICE') return 'Çoktan Seçmeli';
  if (type === 'TRUE_FALSE') return 'Doğru/Yanlış';
  return 'Kısa Cevap';
}

function formatDate(value?: string) {
  if (!value) return 'Belirlenmedi';
  return new Date(value).toLocaleString('tr-TR');
}

export default function AdminExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  useEffect(() => {
    loadExamDetail();
  }, [id]);

  const loadExamDetail = async () => {
    try {
      const examRes = await api.get(`/admin/exams/${id}`);
      setExam(examRes.data);

      const questionsRes = await api.get(`/exam-questions/exam/${id}`);
      setQuestions(questionsRes.data);
    } catch (error) {
      console.error('Error loading exam detail:', error);
      alert('Sınav detayları yüklenirken hata oluştu!');
    }
  };

  const totalPoints = useMemo(() => {
    return questions.reduce((sum, item) => sum + (item.question.points || 0), 0);
  }, [questions]);

  if (!exam) return <div style={styles.loading}>Sınav detayları yükleniyor...</div>;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <button onClick={() => navigate('/admin')} style={styles.backButton}>
            <ArrowLeft size={18} />
            Admin Paneline Dön
          </button>

          <span style={styles.topBadge}>
            <Shield size={15} />
            Admin görünümü
          </span>
        </div>

        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.eyebrow}>
              <Sparkles size={16} />
              Sınav detayları
            </div>

            <div style={styles.titleRow}>
              <div>
                <h1 style={styles.title}>{exam.title}</h1>
                <p style={styles.description}>{exam.description || 'Bu sınav için henüz açıklama eklenmemiş.'}</p>
              </div>

              <span
                style={{
                  ...styles.statusPill,
                  background: exam.published ? '#ecfdf5' : '#fffbeb',
                  color: exam.published ? '#15803d' : '#b45309',
                  border: exam.published ? '1px solid #bbf7d0' : '1px solid #fde68a',
                }}
              >
                {exam.published ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                {exam.published ? 'Yayında' : 'Taslak'}
              </span>
            </div>
          </div>

          <div style={styles.metaGrid}>
            <div style={styles.metaCard}>
              <div style={{ ...styles.metaIcon, background: '#eef2ff', color: '#4f46e5' }}>
                <Clock3 size={21} />
              </div>
              <div>
                <p style={styles.metaLabel}>Süre</p>
                <p style={styles.metaValue}>{exam.duration} dakika</p>
              </div>
            </div>

            <div style={styles.metaCard}>
              <div style={{ ...styles.metaIcon, background: '#f0f9ff', color: '#0284c7' }}>
                <CalendarClock size={21} />
              </div>
              <div>
                <p style={styles.metaLabel}>Başlangıç</p>
                <p style={styles.metaValue}>{formatDate(exam.startTime)}</p>
              </div>
            </div>

            <div style={styles.metaCard}>
              <div style={{ ...styles.metaIcon, background: '#fff7ed', color: '#c2410c' }}>
                <CalendarClock size={21} />
              </div>
              <div>
                <p style={styles.metaLabel}>Bitiş</p>
                <p style={styles.metaValue}>{formatDate(exam.endTime)}</p>
              </div>
            </div>

            <div style={styles.metaCard}>
              <div style={{ ...styles.metaIcon, background: '#ecfdf5', color: '#16a34a' }}>
                <Layers size={21} />
              </div>
              <div>
                <p style={styles.metaLabel}>Soru / Puan</p>
                <p style={styles.metaValue}>
                  {questions.length} soru · {totalPoints} puan
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.questionsPanel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>
              <FileQuestion size={24} color="#2563eb" />
              Sınav Soruları
            </h2>
            <span style={styles.topBadge}>
              <FileText size={15} />
              Toplam {totalPoints} puan
            </span>
          </div>

          {questions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <CircleHelp size={36} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '22px' }}>Henüz soru eklenmemiş</h3>
              <p style={{ margin: '0 auto', maxWidth: '460px', color: '#64748b', lineHeight: 1.6 }}>
                Bu sınava ait soru bulunmuyor. Soru eklendiğinde burada detaylı şekilde görüntülenir.
              </p>
            </div>
          ) : (
            <div style={styles.questionList}>
              {questions.map((eq, index) => (
                <article key={eq.id} style={styles.questionCard}>
                  <div style={styles.questionTop}>
                    <div style={styles.tags}>
                      <span
                        style={{
                          ...styles.tag,
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                        }}
                      >
                        {getQuestionTypeLabel(eq.question.type)}
                      </span>
                      <span
                        style={{
                          ...styles.tag,
                          background: '#f5f3ff',
                          color: '#6d28d9',
                          border: '1px solid #ddd6fe',
                        }}
                      >
                        {eq.question.points} Puan
                      </span>
                    </div>

                    <span style={{ ...styles.topBadge, padding: '7px 10px' }}>#{index + 1}</span>
                  </div>

                  <p style={styles.questionText}>{eq.question.questionText}</p>

                  {eq.question.options && <pre style={styles.optionsBox}>{eq.question.options}</pre>}

                  <div style={styles.answerBox}>Doğru Cevap: {eq.question.correctAnswer || '-'}</div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
