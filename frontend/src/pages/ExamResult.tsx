import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle2, XCircle, MinusCircle, TrendingUp, Clock } from 'lucide-react';
import api from '../api/axios';
import type { Question, ExamAggregate } from '../types';
import { tokens } from '../components/academic-ui';

interface Answer {
  id: number;
  question: Question;
  answerText: string;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  feedback?: string | null;
}

interface ResultData {
  studentExam: { id: number; score: number; status: string; submittedAt: string; exam?: { id: number; title?: string } };
  answers: Answer[];
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
}

interface InstructorInfo { email?: string; fullName?: string; }

function displayAnswer(questionType: string, value: string | null | undefined): string {
  if (!value) return 'Boş';
  if (questionType === 'TRUE_FALSE') {
    const v = value.trim().toLowerCase();
    if (v === 'true' || v === 'd' || v === 'doğru') return 'Doğru';
    if (v === 'false' || v === 'y' || v === 'yanlış') return 'Yanlış';
  }
  return value;
}

function AnswerBox({ label, value, tone }: { label: string; value: ReactNode; tone: 'neutral' | 'good' | 'bad' }) {
  const c = tone === 'good' ? { bg: '#f0faf3', br: '#cdebd7', fg: '#1e8e3e' } : tone === 'bad' ? { bg: '#fff1ef', br: '#ffcdc6', fg: tokens.bad } : { bg: tokens.ivory, br: tokens.hairline, fg: tokens.muted };
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.br}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: c.fg, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: tokens.ink }}>{value}</div>
    </div>
  );
}

export default function ExamResult() {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<ResultData | null>(null);
  const [aggregate, setAggregate] = useState<ExamAggregate | null>(null);
  const [instructor, setInstructor] = useState<InstructorInfo | null>(null);

  const isInstructor = location.pathname.includes('/instructor/');

  useEffect(() => {
    if (!studentExamId) return;
    api.get(`/results/student-exam/${studentExamId}`)
      .then(res => {
        setResult(res.data);
        const examId = res.data.studentExam?.exam?.id;
        if (examId) {
          api.get(`/results/exam/${examId}/aggregate`).then(r => setAggregate(r.data)).catch(() => setAggregate(null));
          api.get(`/exams/${examId}`).then(r => setInstructor(r.data?.instructor || null)).catch(() => setInstructor(null));
        }
      })
      .catch(() => alert('Sonuç yüklenemedi'));
  }, [studentExamId]);

  const handleAskInstructor = () => {
    const examTitle = result?.studentExam.exam?.title || 'Sınav';
    const email = instructor?.email;
    if (!email) { alert('Eğitmen iletişim bilgisi mevcut değil.'); return; }
    const subject = encodeURIComponent(`[${examTitle}] Sınav hakkında soru`);
    const body = encodeURIComponent(`Merhaba ${instructor?.fullName || ''},\n\n${examTitle} sınavıyla ilgili bir sorum var:\n\n\n\nTeşekkürler.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  if (!result) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: tokens.bg, color: tokens.muted }}>Yükleniyor…</div>;
  }

  const totalPoints = result.answers.reduce((sum, a) => sum + (a.question.points || 0), 0);
  const percentage = totalPoints > 0 ? Math.round((result.studentExam.score / totalPoints) * 100) : 0;
  const pct = aggregate ? Math.max(0, Math.min(100, aggregate.yourPercentile)) : null;
  const percentileLine = pct == null ? null : pct >= 50 ? `Sınıfın %${pct.toFixed(0)}'inden yüksek` : `Sınıfın %${(100 - pct).toFixed(0)}'i senden yüksek`;

  const stats = [
    { icon: <CheckCircle2 size={20} />, bg: '#e6f4ea', fg: '#1e8e3e', label: 'Doğru', value: result.correctCount },
    { icon: <XCircle size={20} />, bg: '#ffdad6', fg: tokens.bad, label: 'Yanlış', value: result.incorrectCount },
    { icon: <MinusCircle size={20} />, bg: '#e5eeff', fg: tokens.navy, label: 'Boş', value: result.unansweredCount },
  ];

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '36px 40px 64px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <button onClick={() => isInstructor ? navigate(-1) : navigate('/student?refresh=' + Date.now())} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: tokens.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 14, fontFamily: 'inherit' }}>
            <ArrowLeft size={16} />Geri Dön
          </button>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>{result.studentExam.exam?.title || 'Sınav Sonucu'}</h1>
        </div>

        {/* Score hero */}
        <div style={{ position: 'relative', overflow: 'hidden', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 16, padding: 32, marginBottom: 24, boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: tokens.navy }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, color: tokens.muted, marginBottom: 8 }}>Toplam Puan</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: tokens.navy, letterSpacing: '-0.02em', lineHeight: 1 }}>{result.studentExam.score}<span style={{ fontSize: 26, color: tokens.subtle, fontWeight: 600 }}>/{totalPoints}</span></span>
                <span style={{ background: '#dce1ff', color: tokens.navy, fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 999 }}>%{percentage} Başarı</span>
              </div>
              {percentileLine && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 14, color: tokens.muted }}>
                  <TrendingUp size={16} style={{ color: tokens.indigo }} />{percentileLine}
                </div>
              )}
            </div>
            <button onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: `1px solid ${tokens.hairline}`, background: tokens.card, color: tokens.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Download size={18} />PDF olarak indir
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: s.bg, color: s.fg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 13, color: tokens.muted, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: tokens.ink }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Cevap Detayı */}
        <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Cevap Detayı</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result.answers.map((a, i) => {
            const pending = a.question.type === 'SHORT_ANSWER' && a.isCorrect === null && (a.answerText ?? '').trim() !== '';
            const correct = a.isCorrect === true;
            const wrong = a.isCorrect === false;
            const borderColor = correct ? '#cdebd7' : wrong ? '#ffcdc6' : tokens.hairline;
            const badge = correct ? { bg: '#e6f4ea', fg: '#1e8e3e', text: `Soru ${i + 1}` } : wrong ? { bg: '#ffdad6', fg: tokens.bad, text: `Soru ${i + 1}` } : { bg: '#e5eeff', fg: tokens.muted, text: `Soru ${i + 1}` };
            return (
              <div key={a.id} style={{ position: 'relative', overflow: 'hidden', background: tokens.card, border: `1px solid ${borderColor}`, borderRadius: 14, padding: 24, boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
                {pending && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#c3c0ff' }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: badge.bg, color: badge.fg, fontSize: 12, fontWeight: 700 }}>{badge.text}</span>
                  {correct && <CheckCircle2 size={20} style={{ color: '#1e8e3e' }} />}
                  {wrong && <XCircle size={20} style={{ color: tokens.bad }} />}
                  {pending && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: tokens.muted, fontWeight: 600 }}><Clock size={15} />Eğitmen değerlendirmesi bekleniyor</span>}
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 17, lineHeight: 1.5, color: tokens.ink }}>{a.question.questionText}</p>
                {correct ? (
                  <AnswerBox label="Senin Cevabın / Doğru Cevap" value={displayAnswer(a.question.type, a.answerText)} tone="good" />
                ) : wrong ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                    <AnswerBox label="Senin Cevabın" value={displayAnswer(a.question.type, a.answerText)} tone="bad" />
                    <AnswerBox label="Doğru Cevap" value={displayAnswer(a.question.type, a.question.correctAnswer)} tone="good" />
                  </div>
                ) : (
                  <AnswerBox label="Senin Cevabın" value={a.answerText || 'Boş'} tone="neutral" />
                )}
                {a.feedback && (
                  <div style={{ marginTop: 12, padding: '12px 14px', background: tokens.indigoSoft, border: `1px solid ${tokens.indigoBorder}`, borderRadius: 10, fontSize: 13.5, color: '#3730a3', lineHeight: 1.5 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: tokens.indigo, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Eğitmen Notu</div>
                    {a.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom action */}
        <div style={{ display: 'flex', justifyContent: 'center', borderTop: `1px solid ${tokens.hairline}`, marginTop: 40, paddingTop: 32 }}>
          <button 
            onClick={() => isInstructor ? navigate(-1) : navigate('/student')} 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, 
              padding: '14px 28px', borderRadius: 10, 
              border: `1px solid ${tokens.hairline}`, background: tokens.card, 
              color: tokens.ink, fontSize: 15, fontWeight: 700, 
              cursor: 'pointer', fontFamily: 'inherit' 
            }}
          >
            <ArrowLeft size={18} />{isInstructor ? 'Geri Dön' : 'Sınavlarıma Dön'}
          </button>
        </div>
      </div>
    </div>
  );
}
