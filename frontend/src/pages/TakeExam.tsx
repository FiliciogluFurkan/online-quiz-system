import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Send, Check, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import type { Exam, Question } from '../types';
import Toast from '../components/Toast';
import { tokens, CodeTag, Btn } from '../components/academic-ui';

interface ExamQuestion {
  id: number;
  question: Question;
  orderIndex: number;
}

interface Answer {
  questionId: number;
  answerText: string;
}

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: 'Çoktan Seçmeli',
  TRUE_FALSE: 'Doğru / Yanlış',
  SHORT_ANSWER: 'Kısa Cevap',
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [studentExamId, setStudentExamId] = useState<number | null>(null);
  const [showWarning5Min, setShowWarning5Min] = useState(false);
  const [showWarning1Min, setShowWarning1Min] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'warning' | 'critical'>('warning');

  useEffect(() => {
    loadExam();
  }, [id]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime === 5 * 60 && !showWarning5Min) {
            setToastMessage('⚠️ 5 dakika kaldı! Cevaplarınızı kontrol edin.');
            setToastType('warning');
            setShowWarning5Min(true);
          }
          if (newTime === 60 && !showWarning1Min) {
            setToastMessage('🚨 1 dakika kaldı! Sınav otomatik olarak teslim edilecek.');
            setToastType('critical');
            setShowWarning1Min(true);
          }
          if (newTime <= 0) {
            handleSubmit();
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, showWarning5Min, showWarning1Min]);

  const loadExam = async () => {
    try {
      const examRes = await api.get(`/exams/${id}`);
      setExam(examRes.data);

      const questionsRes = await api.get(`/exam-questions/exam/${id}`);
      setQuestions(questionsRes.data);

      try {
        const existing = await api.get(`/student-exams/check/${id}`);
        if (existing.data && ['SUBMITTED', 'GRADED'].includes(existing.data.status)) {
          alert('Bu sınavı zaten tamamladınız!');
          navigate('/student');
          return;
        }
        if (existing.data && existing.data.status === 'IN_PROGRESS') {
          setStudentExamId(existing.data.id);
          setTimeRemaining(examRes.data.duration * 60);
        } else {
          const studentExamRes = await api.post('/student-exams', {
            exam: { id: parseInt(id!) },
            status: 'IN_PROGRESS',
          });
          setStudentExamId(studentExamRes.data.id);
          setTimeRemaining(examRes.data.duration * 60);
        }
      } catch {
        const studentExamRes = await api.post('/student-exams', {
          exam: { id: parseInt(id!) },
          status: 'IN_PROGRESS',
        });
        setStudentExamId(studentExamRes.data.id);
        setTimeRemaining(examRes.data.duration * 60);
      }

      setAnswers(questionsRes.data.map((eq: ExamQuestion) => ({
        questionId: eq.question.id, answerText: '',
      })));
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Sınav yüklenirken hata oluştu!');
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev =>
      prev.map(a => a.questionId === questionId ? { ...a, answerText: value } : a)
    );
  };

  const handleSubmit = async () => {
    if (!studentExamId) return;
    try {
      const answersMap: Record<string, string> = {};
      answers.forEach(a => {
        if (a.answerText) answersMap[String(a.questionId)] = a.answerText;
      });
      const res = await api.post(`/student-exams/${studentExamId}/submit`, answersMap);
      navigate(`/student/result/${res.data.studentExamId}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Sınav teslim edilirken hata oluştu!');
    }
  };

  if (!exam || questions.length === 0) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>
        Yükleniyor…
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQ.question.id);
  const answeredCount = answers.filter(a => a.answerText).length;
  const warnTimer = timeRemaining <= 5 * 60;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div style={{
      background: tokens.bg, minHeight: '100vh',
      fontFamily: tokens.sans, color: tokens.ink,
    }}>
      {/* Sticky exam bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        padding: '14px 32px', background: tokens.bg,
        borderBottom: `1px solid ${tokens.hairline}`,
      }}>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{
            fontFamily: tokens.mono, fontSize: 10, color: tokens.subtle,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
          }}>Sınav devam ediyor</div>
          <strong style={{
            fontFamily: tokens.serif, fontSize: 18, fontWeight: 400, letterSpacing: '-0.01em',
          }}>{exam.title}</strong>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          padding: '10px 22px', borderRadius: 999,
          background: warnTimer ? '#fef2f2' : '#ffffff',
          border: `1px solid ${warnTimer ? '#fecaca' : tokens.hairline}`,
          boxShadow: warnTimer ? '0 0 0 4px rgba(239,68,68,0.08)' : 'none',
          transition: 'all 0.3s',
        }}>
          <Clock size={16} style={{ color: warnTimer ? '#dc2626' : tokens.indigo }} />
          <div style={{ lineHeight: 1 }}>
            <div style={{
              fontFamily: tokens.mono, fontSize: 9, color: tokens.subtle,
              letterSpacing: '0.12em', textTransform: 'uppercase' as const,
            }}>Kalan Süre</div>
            <div style={{
              fontFamily: tokens.mono, fontSize: 22, fontWeight: 600,
              color: warnTimer ? '#dc2626' : tokens.ink,
              letterSpacing: '0.04em', marginTop: 3,
            }}>{formatTime(timeRemaining)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 11px', borderRadius: 999,
            background: '#fff', border: `1px solid ${tokens.hairline}`,
            fontSize: 11.5, color: tokens.muted,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
            {answeredCount}/{questions.length} cevaplandı
          </div>
        </div>
      </header>

      <main style={{
        padding: '32px 32px 56px', maxWidth: 1280, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32,
      }}>
        {/* Question column */}
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <CodeTag>SORU {String(currentIndex + 1).padStart(2, '0')} / {questions.length}</CodeTag>
            <span style={{ fontSize: 12, color: tokens.subtle }}>{TYPE_LABEL[currentQ.question.type]}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cfcfd6' }} />
            <span style={{ fontSize: 12, color: tokens.subtle }}>{currentQ.question.points} puan</span>
          </div>

          <h1 style={{
            margin: 0, fontFamily: tokens.serif,
            fontSize: 28, fontWeight: 400, lineHeight: 1.4,
            letterSpacing: '-0.015em', color: tokens.ink,
          }}>{currentQ.question.questionText}</h1>

          {/* Options */}
          <div style={{ marginTop: 28, display: 'grid', gap: 10 }}>
            {currentQ.question.type === 'MULTIPLE_CHOICE' && currentQ.question.options &&
              currentQ.question.options.split('\n').map((option, idx) => {
                const letter = option.charAt(0);
                const sel = currentAnswer?.answerText === letter;
                return (
                  <label key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px', cursor: 'pointer',
                    background: sel ? tokens.indigoSoft : '#fff',
                    border: `1px solid ${sel ? '#bfc4ee' : tokens.hairline}`,
                    borderRadius: 12, transition: 'all 0.15s',
                  }}>
                    <input
                      type="radio"
                      name={`q-${currentQ.question.id}`}
                      value={letter}
                      checked={sel}
                      onChange={() => handleAnswerChange(currentQ.question.id, letter)}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: sel ? tokens.indigo : '#fff',
                      color: sel ? '#fff' : tokens.subtle,
                      border: `1px solid ${sel ? tokens.indigo : tokens.hairline}`,
                      display: 'grid', placeItems: 'center',
                      fontFamily: tokens.mono,
                      fontSize: 13, fontWeight: 600, flexShrink: 0,
                    }}>{letter}</span>
                    <span style={{ fontSize: 15, color: tokens.ink, fontWeight: sel ? 500 : 400 }}>
                      {option.substring(option.indexOf(')') + 1).trim() || option.substring(1).trim()}
                    </span>
                    {sel && <Check size={16} style={{ color: tokens.indigo, marginLeft: 'auto' }} />}
                  </label>
                );
              })
            }

            {currentQ.question.type === 'TRUE_FALSE' && [
              { val: 'true', label: 'Doğru' },
              { val: 'false', label: 'Yanlış' },
            ].map(opt => {
              const sel = currentAnswer?.answerText === opt.val;
              return (
                <label key={opt.val} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', cursor: 'pointer',
                  background: sel ? tokens.indigoSoft : '#fff',
                  border: `1px solid ${sel ? '#bfc4ee' : tokens.hairline}`,
                  borderRadius: 12,
                }}>
                  <input
                    type="radio"
                    name={`q-${currentQ.question.id}`}
                    value={opt.val}
                    checked={sel}
                    onChange={() => handleAnswerChange(currentQ.question.id, opt.val)}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: sel ? tokens.indigo : '#fff',
                    color: sel ? '#fff' : tokens.subtle,
                    border: `1px solid ${sel ? tokens.indigo : tokens.hairline}`,
                    display: 'grid', placeItems: 'center',
                    fontFamily: tokens.mono, fontSize: 13, fontWeight: 600,
                  }}>{opt.val === 'true' ? 'D' : 'Y'}</span>
                  <span style={{ fontSize: 15, color: tokens.ink, fontWeight: sel ? 500 : 400 }}>
                    {opt.label}
                  </span>
                  {sel && <Check size={16} style={{ color: tokens.indigo, marginLeft: 'auto' }} />}
                </label>
              );
            })}

            {currentQ.question.type === 'SHORT_ANSWER' && (
              <textarea
                value={currentAnswer?.answerText || ''}
                onChange={(e) => handleAnswerChange(currentQ.question.id, e.target.value)}
                placeholder="Cevabınızı buraya yazın…"
                rows={6}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#fafafb',
                  border: `1px solid ${tokens.hairline}`,
                  borderRadius: 12,
                  fontFamily: tokens.mono, fontSize: 14, color: tokens.ink,
                  resize: 'vertical', boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            )}
          </div>

          {/* Nav buttons */}
          <div style={{
            marginTop: 40, paddingTop: 24, borderTop: `1px solid ${tokens.hairline}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Btn
              variant="ghost"
              onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              icon={<ArrowLeft size={14} />}
            >Önceki Soru</Btn>
            <span style={{
              fontFamily: tokens.mono, fontSize: 11, color: tokens.subtle, letterSpacing: '0.08em',
            }}>
              {String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
            </span>
            <Btn
              variant={isLastQuestion ? 'dark' : 'primary'}
              onClick={() => isLastQuestion ? handleSubmit() : setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
              iconR={isLastQuestion ? <Send size={14} /> : <ArrowRight size={14} />}
            >{isLastQuestion ? 'Sınavı Bitir' : 'Sonraki Soru'}</Btn>
          </div>
        </div>

        {/* Palette */}
        <aside style={{
          position: 'sticky', top: 80, alignSelf: 'flex-start',
          padding: 22, background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
        }}>
          <div style={{
            fontFamily: tokens.mono, fontSize: 10, color: tokens.subtle,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 4,
          }}>Soru haritası</div>
          <div style={{
            fontFamily: tokens.serif, fontSize: 22, color: tokens.ink, lineHeight: 1, marginBottom: 16,
          }}>
            {answeredCount}/{questions.length}
            <span style={{ fontSize: 13, color: tokens.subtle }}> cevaplandı</span>
          </div>

          <div style={{
            height: 4, background: tokens.hairlineSoft, borderRadius: 2,
            overflow: 'hidden', marginBottom: 18,
          }}>
            <div style={{
              width: `${(answeredCount / questions.length) * 100}%`,
              height: '100%', background: tokens.indigo,
            }} />
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 18,
          }}>
            {questions.map((q, idx) => {
              const hasAnswer = !!answers.find(a => a.questionId === q.question.id)?.answerText;
              const isCurrent = idx === currentIndex;
              let bg = '#fff', fg = tokens.subtle, br = tokens.hairline;
              if (isCurrent) { bg = tokens.indigo; fg = '#fff'; br = tokens.indigo; }
              else if (hasAnswer) { bg = tokens.indigoSoft; fg = '#3730a3'; br = tokens.indigoBorder; }
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: bg, color: fg, border: `1px solid ${br}`,
                    fontFamily: tokens.mono, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>{idx + 1}</button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {[
              [tokens.indigo, tokens.indigo, 'Mevcut soru', 1],
              [tokens.indigoSoft, tokens.indigoBorder, 'Cevaplanmış', answeredCount],
              ['#fff', tokens.hairline, 'Boş', questions.length - answeredCount],
            ].map(([bg, br, lbl, n]) => (
              <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: 3,
                  background: bg as string, border: `1px solid ${br}`,
                }} />
                <span style={{ color: tokens.text, flex: 1 }}>{lbl}</span>
                <span style={{ fontFamily: tokens.mono, fontSize: 11, color: tokens.subtle }}>{n}</span>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: `1px solid ${tokens.hairline}`, margin: '18px 0' }} />

          <Btn variant="dark" onClick={handleSubmit} icon={<Send size={14} />}
            style={{ width: '100%', justifyContent: 'center', padding: 11 }}>
            Sınavı Bitir
          </Btn>
          <p style={{
            margin: '10px 0 0', fontSize: 11, color: tokens.subtle,
            lineHeight: 1.5, textAlign: 'center' as const,
          }}>
            Teslim ettikten sonra değişiklik yapamazsın.
          </p>

          {warnTimer && (
            <div style={{
              marginTop: 14, padding: 10, background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 8,
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <AlertTriangle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 11.5, color: '#991b1b', lineHeight: 1.5 }}>
                Süre azalıyor — cevaplarını kontrol et.
              </div>
            </div>
          )}
        </aside>
      </main>

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
