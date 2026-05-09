import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  FileQuestion,
  Save,
  Shield,
  Sparkles,
  Trophy,
} from 'lucide-react';
import api from '../api/axios';
import type { Question } from '../types';

interface Answer {
  id: number;
  question: Question;
  answerText: string;
  isCorrect: boolean | null;
  pointsEarned: number | null;
}

interface ResultData {
  studentExam: {
    id: number;
    score: number;
    status: string;
    submittedAt: string;
  };
  answers: Answer[];
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
    maxWidth: '1280px',
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
  title: {
    margin: 0,
    fontSize: '42px',
    lineHeight: 1.08,
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
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) 340px',
    gap: '24px',
    alignItems: 'start',
  },
  answerList: {
    display: 'grid',
    gap: '16px',
  },
  answerCard: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    padding: '22px',
    boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
  },
  questionTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
  },
  tags: {
    display: 'flex',
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
    fontSize: '18px',
    lineHeight: 1.65,
    fontWeight: 900,
  },
  answerBox: {
    marginTop: '16px',
    padding: '18px',
    borderRadius: '18px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  answerLabel: {
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: 900,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  answerText: {
    color: '#0f172a',
    lineHeight: 1.7,
    fontSize: '15px',
    whiteSpace: 'pre-wrap' as const,
    fontWeight: 700,
  },
  gradingSection: {
    marginTop: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
    padding: '18px',
    borderRadius: '20px',
    background: '#fffaf0',
    border: '1px solid #fed7aa',
  },
  gradingInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: '200px',
  },
  scoreInput: {
    width: '100px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    borderRadius: '14px',
    padding: '12px',
    fontSize: '18px',
    fontWeight: 900,
    textAlign: 'center' as const,
    color: '#0f172a',
    outline: 'none',
  },
  saveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '12px 16px',
    cursor: 'pointer',
    color: '#1d4ed8',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
  },
  savedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '12px 14px',
    borderRadius: '16px',
    background: '#ecfdf5',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    fontWeight: 900,
  },
  summaryCard: {
    position: 'sticky' as const,
    top: '24px',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
  },
  summaryTop: {
    padding: '24px',
    background: 'linear-gradient(135deg, rgba(238,242,255,0.95), rgba(240,249,255,0.9))',
    borderBottom: '1px solid #e2e8f0',
  },
  summaryTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 950,
    color: '#0f172a',
  },
  summaryBody: {
    padding: '22px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px',
    fontWeight: 800,
    color: '#334155',
  },
  totalScore: {
    padding: '26px 0 12px',
    textAlign: 'center' as const,
  },
  scoreValue: {
    fontSize: '54px',
    lineHeight: 1,
    fontWeight: 950,
    color: '#4f46e5',
    marginBottom: '8px',
  },
  scoreLabel: {
    color: '#64748b',
    fontWeight: 800,
    fontSize: '13px',
  },
  emptyState: {
    padding: '54px 24px',
    textAlign: 'center' as const,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
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

export default function ManualGrading() {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultData | null>(null);
  const [grades, setGrades] = useState<Record<number, number>>({});
  const [savedAnswers, setSavedAnswers] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadResult();
  }, [studentExamId]);

  const loadResult = async () => {
    try {
      const res = await api.get(`/results/student-exam/${studentExamId}`);
      setResult(res.data);

      const initialGrades: Record<number, number> = {};
      res.data.answers.forEach((answer: Answer) => {
        if (answer.pointsEarned !== null) {
          initialGrades[answer.id] = answer.pointsEarned;
        }
      });

      setGrades(initialGrades);
    } catch (error) {
      console.error('Error loading result:', error);
      alert('Sonuç yüklenirken hata oluştu!');
    }
  };

  const handleGradeChange = (answerId: number, value: string) => {
    const numValue = parseInt(value);

    if (!isNaN(numValue)) {
      setGrades({ ...grades, [answerId]: numValue });

      setSavedAnswers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(answerId);
        return newSet;
      });
    }
  };

  const handleSaveGrade = async (answerId: number, maxPoints: number) => {
    const pointsEarned = grades[answerId];

    if (pointsEarned === undefined || pointsEarned < 0 || pointsEarned > maxPoints) {
      alert(`Puan 0 ile ${maxPoints} arasında olmalıdır!`);
      return;
    }

    try {
      await api.put(`/results/answer/${answerId}/grade`, { pointsEarned });

      setSavedAnswers((prev) => new Set(prev).add(answerId));

      await loadResult();

      alert('Puan kaydedildi!');
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Puan kaydedilirken hata oluştu!');
    }
  };

  const manualAnswers = useMemo(() => {
    if (!result) return [];

    return result.answers.filter(
      (a) => a.question.type === 'SHORT_ANSWER' || a.isCorrect === null
    );
  }, [result]);

  const totalPossiblePoints = useMemo(() => {
    if (!result) return 0;

    return result.answers.reduce((sum, a) => sum + (a.question.points || 0), 0);
  }, [result]);

  if (!result) return <div style={styles.loading}>Manuel puanlama yükleniyor...</div>;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <ArrowLeft size={18} />
            Geri Dön
          </button>

          <span style={styles.topBadge}>
            <Shield size={15} />
            Eğitmen değerlendirmesi
          </span>
        </div>

        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.eyebrow}>
              <Sparkles size={16} />
              Manuel değerlendirme
            </div>

            <h1 style={styles.title}>Kısa Cevap Puanlama</h1>

            <p style={styles.subtitle}>
              Öğrenci cevaplarını detaylı şekilde inceleyip manuel puanlama yapabilirsiniz.
            </p>
          </div>
        </section>

        <div style={styles.contentGrid}>
          <div>
            {manualAnswers.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <CircleHelp size={36} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '22px' }}>
                  Manuel puanlama gerekmiyor
                </h3>
                <p
                  style={{
                    margin: '0 auto',
                    maxWidth: '460px',
                    color: '#64748b',
                    lineHeight: 1.6,
                  }}
                >
                  Tüm sorular otomatik değerlendirildi veya kısa cevap sorusu bulunmuyor.
                </p>
              </div>
            ) : (
              <div style={styles.answerList}>
                {manualAnswers.map((answer, index) => (
                  <article key={answer.id} style={styles.answerCard}>
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
                          <BookOpen size={13} />
                          Kısa Cevap
                        </span>

                        <span
                          style={{
                            ...styles.tag,
                            background: '#fff7ed',
                            color: '#c2410c',
                            border: '1px solid #fed7aa',
                          }}
                        >
                          Maksimum {answer.question.points} puan
                        </span>
                      </div>

                      <span style={styles.topBadge}>#{index + 1}</span>
                    </div>

                    <p style={styles.questionText}>{answer.question.questionText}</p>

                    <div style={styles.answerBox}>
                      <div style={styles.answerLabel}>Öğrenci cevabı</div>
                      <div style={styles.answerText}>
                        {answer.answerText || '(Boş bırakılmış)'}
                      </div>
                    </div>

                    {answer.question.correctAnswer && (
                      <div
                        style={{
                          ...styles.answerBox,
                          background: '#f0fdf4',
                          borderColor: '#bbf7d0',
                        }}
                      >
                        <div style={styles.answerLabel}>Örnek cevap / açıklama</div>
                        <div style={styles.answerText}>{answer.question.correctAnswer}</div>
                      </div>
                    )}

                    <div style={styles.gradingSection}>
                      <div style={styles.gradingInfo}>
                        <AlertCircle size={22} color="#c2410c" />
                        <div>
                          <div style={{ fontWeight: 900, color: '#0f172a' }}>Puan Ver</div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            0 - {answer.question.points} arası
                          </div>
                        </div>
                      </div>

                      <input
                        type="number"
                        min="0"
                        max={answer.question.points}
                        step="1"
                        value={grades[answer.id] ?? ''}
                        onChange={(e) => handleGradeChange(answer.id, e.target.value)}
                        placeholder="0"
                        style={styles.scoreInput}
                      />

                      {savedAnswers.has(answer.id) ? (
                        <div style={styles.savedBadge}>
                          <CheckCircle2 size={17} />
                          Kaydedildi
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSaveGrade(answer.id, answer.question.points)}
                          style={styles.saveButton}
                        >
                          <Save size={17} />
                          Kaydet
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside style={styles.summaryCard}>
            <div style={styles.summaryTop}>
              <h3 style={styles.summaryTitle}>Değerlendirme Özeti</h3>
            </div>

            <div style={styles.summaryBody}>
              <div style={styles.summaryItem}>
                <span>Toplam Soru</span>
                <strong>{result.answers.length}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span>Manuel Değerlendirme</span>
                <strong>{manualAnswers.length}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span>Kaydedilen</span>
                <strong>{savedAnswers.size}</strong>
              </div>

              <div style={styles.totalScore}>
                <div style={styles.scoreValue}>{result.studentExam.score}</div>
                <div style={styles.scoreLabel}>/{totalPossiblePoints} puan</div>
              </div>

              <div
                style={{
                  marginTop: '18px',
                  padding: '16px',
                  borderRadius: '20px',
                  background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Trophy size={22} color="#4f46e5" />
                <div>
                  <div style={{ fontWeight: 900, color: '#0f172a' }}>Anlık Skor</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Güncel toplam puan görüntüleniyor.
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
