import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  CircleHelp,
  FileQuestion,
  Layers,
  Plus,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import type { Question } from '../types';

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
    maxWidth: '1120px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
    marginBottom: '10px',
  },
  title: {
    margin: 0,
    fontSize: '42px',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
    fontWeight: 950,
    color: '#0f172a',
  },
  subtitle: {
    margin: '10px 0 0',
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.65,
    maxWidth: '650px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '15px',
    padding: '13px 17px',
    border: '1px solid #bbf7d0',
    background: 'linear-gradient(135deg, #ecfdf5, #ffffff)',
    color: '#15803d',
    fontWeight: 950,
    cursor: 'pointer',
    boxShadow: '0 14px 30px rgba(22,163,74,0.10)',
  },
  disabledButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '15px',
    padding: '13px 17px',
    border: '1px solid #e2e8f0',
    background: '#f1f5f9',
    color: '#94a3b8',
    fontWeight: 950,
    cursor: 'not-allowed',
  },
  ghostButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '15px',
    padding: '13px 16px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#475569',
    fontWeight: 900,
    cursor: 'pointer',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '22px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid #e2e8f0',
    borderRadius: '22px',
    padding: '18px',
    boxShadow: '0 16px 42px rgba(15,23,42,0.055)',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '15px',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  statLabel: {
    margin: 0,
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 800,
  },
  statValue: {
    margin: '3px 0 0',
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: 950,
  },
  panel: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    boxShadow: '0 24px 70px rgba(15,23,42,0.065)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '22px 24px',
    borderBottom: '1px solid #eef2f7',
    background: 'linear-gradient(135deg, rgba(248,250,252,0.96), rgba(239,246,255,0.75))',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
    fontSize: '21px',
    color: '#0f172a',
  },
  list: {
    padding: '20px',
    display: 'grid',
    gap: '14px',
  },
  questionCard: {
    display: 'grid',
    gridTemplateColumns: '46px 1fr',
    gap: '14px',
    padding: '18px',
    borderRadius: '22px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 12px 30px rgba(15,23,42,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  selectedCard: {
    background: 'linear-gradient(135deg, #f0f9ff, #ffffff)',
    border: '1px solid #93c5fd',
    boxShadow: '0 16px 38px rgba(37,99,235,0.10)',
  },
  checkBox: {
    width: '26px',
    height: '26px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    marginTop: '2px',
  },
  selectedCheckBox: {
    background: '#2563eb',
    border: '1px solid #2563eb',
    color: '#ffffff',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '9px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 9px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900,
  },
  questionText: {
    margin: 0,
    color: '#0f172a',
    fontSize: '16px',
    lineHeight: 1.6,
    fontWeight: 850,
  },
  optionsBox: {
    margin: '12px 0 0',
    padding: '12px',
    borderRadius: '15px',
    background: '#f8fafc',
    border: '1px solid #eef2f7',
    color: '#475569',
    fontSize: '13px',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  emptyState: {
    padding: '58px 24px',
    textAlign: 'center',
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

function getQuestionTypeLabel(type: string) {
  if (type === 'MULTIPLE_CHOICE') return 'Çoktan Seçmeli';
  if (type === 'TRUE_FALSE') return 'Doğru/Yanlış';
  return 'Kısa Cevap';
}

export default function AddQuestionsToExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

  useEffect(() => {
    api.get('/questions').then((res) => setQuestions(res.data));
  }, []);

  const toggleQuestion = (questionId: number) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const selectedPoints = useMemo(() => {
    return questions
      .filter((question) => selectedQuestions.includes(question.id))
      .reduce((sum, question) => sum + (question.points || 0), 0);
  }, [questions, selectedQuestions]);

  const handleAddQuestions = async () => {
    try {
      for (const questionId of selectedQuestions) {
        await api.post('/exam-questions', {
          exam: { id: parseInt(id!) },
          question: { id: questionId },
          orderIndex: 0,
        });
      }
      alert(`${selectedQuestions.length} soru eklendi!`);
      navigate(`/instructor/exam/${id}`);
    } catch (error) {
      alert('Hata oluştu!');
      console.error(error);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              <Sparkles size={15} />
              Sınav içeriği
            </div>
            <h1 style={styles.title}>Sınava Soru Ekle</h1>
            <p style={styles.subtitle}>
              Soru bankasından sınava eklemek istediğin soruları seç. Seçilen sorular sınav detayına kaydedilir.
            </p>
          </div>

          <div style={styles.actions}>
            <button
              onClick={handleAddQuestions}
              disabled={selectedQuestions.length === 0}
              style={selectedQuestions.length > 0 ? styles.primaryButton : styles.disabledButton}
            >
              <CheckCircle2 size={17} />
              Seçilenleri Ekle ({selectedQuestions.length})
            </button>
            <button onClick={() => navigate(`/instructor/exam/${id}`)} style={styles.ghostButton}>
              <ArrowLeft size={17} />
              Geri Dön
            </button>
          </div>
        </header>

        <section style={styles.summaryGrid}>
          <article style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: '#eef2ff', color: '#4f46e5' }}>
              <Layers size={22} />
            </div>
            <div>
              <p style={styles.statLabel}>Toplam Soru</p>
              <p style={styles.statValue}>{questions.length}</p>
            </div>
          </article>

          <article style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: '#f0f9ff', color: '#0284c7' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p style={styles.statLabel}>Seçilen Soru</p>
              <p style={styles.statValue}>{selectedQuestions.length}</p>
            </div>
          </article>

          <article style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: '#ecfdf5', color: '#16a34a' }}>
              <FileQuestion size={22} />
            </div>
            <div>
              <p style={styles.statLabel}>Seçilen Puan</p>
              <p style={styles.statValue}>{selectedPoints}</p>
            </div>
          </article>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>
              <BookOpen size={23} color="#2563eb" />
              Soru Bankası
            </h2>
            <span style={styles.eyebrow}>Kartlara tıklayarak seçim yap</span>
          </div>

          {questions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <CircleHelp size={36} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '22px' }}>Soru bankasında henüz soru yok</h3>
              <p style={{ margin: '0 auto 22px', maxWidth: '460px', color: '#64748b', lineHeight: 1.6 }}>
                Önce soru bankasına birkaç soru ekleyerek bu sınava içerik seçebilirsin.
              </p>
              <button onClick={() => navigate('/instructor/questions')} style={styles.primaryButton}>
                <Plus size={17} />
                Soru Bankasına Git
              </button>
            </div>
          ) : (
            <div style={styles.list}>
              {questions.map((q, index) => {
                const selected = selectedQuestions.includes(q.id);
                return (
                  <article
                    key={q.id}
                    onClick={() => toggleQuestion(q.id)}
                    style={{ ...styles.questionCard, ...(selected ? styles.selectedCard : {}) }}
                  >
                    <div style={{ ...styles.checkBox, ...(selected ? styles.selectedCheckBox : {}) }}>
                      {selected && <Check size={17} />}
                    </div>

                    <div>
                      <div style={styles.tags}>
                        <span style={{ ...styles.tag, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                          {getQuestionTypeLabel(q.type)}
                        </span>
                        <span style={{ ...styles.tag, background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
                          {q.points} Puan
                        </span>
                        <span style={{ ...styles.tag, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                          #{index + 1}
                        </span>
                      </div>

                      <p style={styles.questionText}>{q.questionText}</p>

                      {q.options && <pre style={styles.optionsBox}>{q.options}</pre>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
