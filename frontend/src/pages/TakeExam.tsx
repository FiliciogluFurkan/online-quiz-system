import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Send, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { resolveImageUrl } from '../api/images';
import type { Exam, Question } from '../types';
import Toast from '../components/Toast';
import { tokens, Btn } from '../components/academic-ui';

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

// Kalan süre: min(etkin başlangıç + süre, sınav bitişi) - şu an (saniye).
// Etkin başlangıç = max(öğrencinin başlama anı, sınavın başlangıç saati). Böylece
// sınav tarihi sonradan değiştirilse veya eski/tutarsız bir başlama anı kalsa bile
// kalan süre güncel sınav penceresine göre hesaplanır; geç girene yeni süre verilmez.
function remainingSeconds(startedAtMs: number, durationMin: number, startTime?: string | null, endTime?: string | null): number {
  let effectiveStart = startedAtMs;
  if (startTime) {
    const start = new Date(startTime).getTime();
    if (!isNaN(start)) effectiveStart = Math.max(effectiveStart, start);
  }
  let deadline = effectiveStart + durationMin * 60_000;
  if (endTime) {
    const end = new Date(endTime).getTime();
    if (!isNaN(end)) deadline = Math.min(deadline, end);
  }
  return Math.max(0, Math.floor((deadline - Date.now()) / 1000));
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
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const storageKey = id ? `quiz-answers-${id}` : null;

  useEffect(() => { loadExam(); }, [id]);

  // Sınav sırasında kazara çıkışı engelle: geri tuşu ve sekme kapatma/yenilemede onay sor.
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);

    // Tarayıcı "geri" tuşu: fazladan bir history girdisi ekleyip popstate'i yakala.
    window.history.pushState(null, '', window.location.href);
    const onPop = () => {
      const leave = window.confirm('Sınavdan çıkmak istediğinize emin misiniz? Çıkarsanız ilerlemeniz kaybolabilir.');
      if (leave) {
        window.removeEventListener('popstate', onPop);
        navigate('/student');
      } else {
        // Kalsın: history girdisini geri koy
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', onPop);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', onPop);
    };
  }, [navigate]);

  useEffect(() => {
    if (!storageKey || answers.length === 0) return;
    try { localStorage.setItem(storageKey, JSON.stringify(answers)); }
    catch (err) { console.warn('Auto-save failed:', err); }
  }, [answers, storageKey]);

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
          if (newTime <= 0) { handleSubmit(); return 0; }
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

      // Mevcut bir kayıt var mı? (tamamlanmış / devam eden)
      let existingData: { id?: number; status?: string; startedAt?: string } | null = null;
      try {
        const existing = await api.get(`/student-exams/check/${id}`);
        existingData = existing.data ?? null;
      } catch { /* kayıt yok say, başlatmayı dene */ }

      if (existingData && ['SUBMITTED', 'GRADED'].includes(existingData.status ?? '')) {
        alert('Bu sınavı zaten tamamladınız!');
        navigate('/student');
        return;
      }

      if (existingData && existingData.status === 'IN_PROGRESS' && existingData.id != null) {
        setStudentExamId(existingData.id);
        const startedMs = existingData.startedAt ? Date.parse(existingData.startedAt) : Date.now();
        const rem = remainingSeconds(startedMs, examRes.data.duration, examRes.data.startTime, examRes.data.endTime);
        if (rem <= 0) { alert('Sınavın süresi doldu.'); navigate('/student'); return; }
        setTimeRemaining(rem);
      } else {
        // Yeni başlatma: backend süre/erişim kontrollerini burada uygular
        // (örn. "Sınavın süresi doldu", "Sınav henüz başlamadı").
        try {
          const studentExamRes = await api.post('/student-exams', { exam: { id: parseInt(id!) }, status: 'IN_PROGRESS' });
          setStudentExamId(studentExamRes.data.id);
          const startedMs = studentExamRes.data.startedAt ? Date.parse(studentExamRes.data.startedAt) : Date.now();
          setTimeRemaining(remainingSeconds(startedMs, examRes.data.duration, examRes.data.startTime, examRes.data.endTime));
        } catch (startErr) {
          const data = (startErr as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
          alert(data?.error || data?.message || 'Sınav başlatılamadı.');
          navigate('/student');
          return;
        }
      }

      let initialAnswers: Answer[] = questionsRes.data.map((eq: ExamQuestion) => ({ questionId: eq.question.id, answerText: '' }));
      if (storageKey) {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const saved: Answer[] = JSON.parse(raw);
            initialAnswers = initialAnswers.map(a => {
              const s = saved.find(x => x.questionId === a.questionId);
              return s ? { ...a, answerText: s.answerText } : a;
            });
          }
        } catch (err) { console.warn('Failed to restore saved answers:', err); }
      }
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Sınav yüklenirken hata oluştu!');
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, answerText: value } : a));
  };

  const submitNow = async () => {
    if (!studentExamId || submitting) return;
    setSubmitting(true);
    try {
      const answersMap: Record<string, string> = {};
      answers.forEach(a => { if (a.answerText) answersMap[String(a.questionId)] = a.answerText; });
      const res = await api.post(`/student-exams/${studentExamId}/submit`, answersMap);
      if (storageKey) { try { localStorage.removeItem(storageKey); } catch {/* ignore */} }
      navigate(`/student/result/${res.data.studentExamId}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Sınav teslim edilirken hata oluştu!');
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (timeRemaining <= 0) submitNow();
    else setConfirmSubmit(true);
  };

  if (!exam || questions.length === 0) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: tokens.bg, color: tokens.muted }}>Yükleniyor…</div>;
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQ.question.id);
  const answeredCount = answers.filter(a => a.answerText).length;
  const warnTimer = timeRemaining <= 5 * 60;
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;

  const optionRow = (key: string, letter: string, text: string, selected: boolean, onSelect: () => void) => (
    <label key={key} onClick={onSelect} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 10, cursor: 'pointer',
      border: selected ? `2px solid ${tokens.navy}` : `1px solid ${tokens.hairline}`,
      background: selected ? '#eef2ff' : tokens.card,
    }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected ? tokens.navy : tokens.hairline}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        {selected && <span style={{ width: 10, height: 10, borderRadius: '50%', background: tokens.navy }} />}
      </span>
      <span style={{ fontSize: 15, color: selected ? tokens.navy : tokens.ink }}>
        {letter && <strong style={{ marginRight: 8 }}>{letter}:</strong>}{text}
      </span>
    </label>
  );

  return (
    <div style={{ background: tokens.bg, minHeight: '100vh', fontFamily: tokens.sans, color: tokens.ink }}>
      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '0 32px', height: 72, background: tokens.card, borderBottom: `1px solid ${tokens.hairline}` }}>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: tokens.bad, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sınav Devam Ediyor</div>
          <strong style={{ fontSize: 18, fontWeight: 700 }}>{exam.title}</strong>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: '#ffdad6', color: '#93000a', fontWeight: 700, fontSize: 14, boxShadow: warnTimer ? '0 0 0 4px rgba(186,26,26,0.12)' : 'none' }}>
          <Clock size={17} />KALAN SÜRE {formatTime(timeRemaining)}
        </div>
        <div style={{ fontSize: 13.5, color: tokens.muted, fontWeight: 600 }}>{answeredCount}/{questions.length} cevaplandı</div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '32px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
        {/* Question column */}
        <div style={{ maxWidth: 800 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: `1px solid ${tokens.hairline}` }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>SORU {String(currentIndex + 1).padStart(2, '0')} / {questions.length}</span>
            <div style={{ display: 'flex', gap: 16, fontSize: 13.5, color: tokens.muted }}>
              <span>{TYPE_LABEL[currentQ.question.type]}</span>
              <span>{currentQ.question.points} puan</span>
            </div>
          </div>

          <div style={{ fontSize: 19, lineHeight: 1.5, color: tokens.ink, padding: '20px 0 8px', fontWeight: 500 }}>{currentQ.question.questionText}</div>

          {currentQ.question.imageUrl && (
            <img src={resolveImageUrl(currentQ.question.imageUrl)} alt="Soru görseli"
              style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 12, border: `1px solid ${tokens.hairline}`, objectFit: 'contain', display: 'block', margin: '4px 0 8px' }} />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {currentQ.question.type === 'MULTIPLE_CHOICE' && currentQ.question.options &&
              currentQ.question.options.split('\n').filter(Boolean).map((option, idx) => {
                const letter = option.trim().charAt(0).toUpperCase();
                const text = option.substring(option.indexOf(')') + 1).trim() || option.substring(1).trim();
                const sel = currentAnswer?.answerText === letter;
                return optionRow(`mc-${idx}`, letter, text, sel, () => handleAnswerChange(currentQ.question.id, letter));
              })}

            {currentQ.question.type === 'TRUE_FALSE' && [
              { val: 'true', letter: 'D', label: 'Doğru' },
              { val: 'false', letter: 'Y', label: 'Yanlış' },
            ].map(opt => optionRow(opt.val, opt.letter, opt.label, currentAnswer?.answerText === opt.val, () => handleAnswerChange(currentQ.question.id, opt.val)))}

            {currentQ.question.type === 'SHORT_ANSWER' && (
              <textarea value={currentAnswer?.answerText || ''} onChange={e => handleAnswerChange(currentQ.question.id, e.target.value)}
                placeholder="Cevabınızı buraya yazın…" rows={6}
                style={{ width: '100%', padding: '14px 16px', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 12, fontFamily: 'inherit', fontSize: 15, color: tokens.ink, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
            )}
          </div>

          {/* Nav footer */}
          <div style={{ marginTop: 32, paddingTop: 22, borderTop: `1px solid ${tokens.hairline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button disabled={isFirst} onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', color: isFirst ? tokens.subtle : tokens.navy, cursor: isFirst ? 'not-allowed' : 'pointer' }}>
              <ArrowLeft size={18} />Önceki Soru
            </button>
            <span style={{ fontSize: 13, color: tokens.subtle, fontWeight: 600 }}>{String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}</span>
            <button disabled={isLast} onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', color: isLast ? tokens.subtle : tokens.navy, cursor: isLast ? 'not-allowed' : 'pointer' }}>
              Sonraki Soru<ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 22 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Soru Haritası</h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: tokens.muted }}>{answeredCount}/{questions.length} cevaplandı</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
              {questions.map((q, idx) => {
                const hasAnswer = !!answers.find(a => a.questionId === q.question.id)?.answerText;
                const isCurrent = idx === currentIndex;
                let bg = tokens.card, fg = tokens.muted, br = tokens.hairline, bw = 1;
                if (isCurrent) { bg = tokens.navy; fg = '#fff'; br = tokens.navy; }
                else if (hasAnswer) { bg = tokens.card; fg = tokens.navy; br = tokens.navy; bw = 2; }
                return (
                  <button key={q.id} onClick={() => setCurrentIndex(idx)}
                    style={{ height: 40, borderRadius: 8, background: bg, color: fg, border: `${bw}px solid ${br}`, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{idx + 1}</button>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: tokens.muted }}>
              {[
                { bg: tokens.navy, br: tokens.navy, bw: 1, label: 'Mevcut soru' },
                { bg: tokens.card, br: tokens.navy, bw: 2, label: 'Cevaplanmış' },
                { bg: tokens.card, br: tokens.hairline, bw: 1, label: 'Boş' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, background: l.bg, border: `${l.bw}px solid ${l.br}` }} />{l.label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={handleSubmit} style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: tokens.navy, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Send size={16} />Sınavı Bitir
            </button>
            <p style={{ margin: 0, fontSize: 12, color: tokens.subtle, textAlign: 'center', lineHeight: 1.5 }}>Teslim ettikten sonra değişiklik yapamazsın.</p>
            {warnTimer && (
              <div style={{ marginTop: 4, padding: 12, background: '#ffe9e6', border: '1px solid #ffcdc6', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={16} style={{ color: '#93000a', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: '#93000a', lineHeight: 1.45 }}>Süre azalıyor — cevaplarını kontrol et.</span>
              </div>
            )}
          </div>
        </aside>
      </main>

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}

      {confirmSubmit && (
        <div onClick={() => !submitting && setConfirmSubmit(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(11,28,48,0.55)', display: 'grid', placeItems: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 460, width: '100%', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 16, padding: 28, boxShadow: '0 18px 48px rgba(11,28,48,0.18)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: tokens.bad, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <AlertTriangle size={15} />Onay gerekli
            </div>
            <h2 style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 700 }}>Sınavı teslim et?</h2>
            <p style={{ margin: '12px 0 0', color: tokens.muted, lineHeight: 1.6, fontSize: 14 }}>
              {answeredCount} soruyu cevapladın, <strong>{questions.length - answeredCount}</strong> soru hâlâ boş. Teslim ettikten sonra cevaplarını değiştiremezsin.
            </p>
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn type="button" onClick={() => setConfirmSubmit(false)} disabled={submitting}>Geri Dön</Btn>
              <Btn variant="primary" onClick={submitNow} disabled={submitting} icon={<Send size={14} />}>{submitting ? 'Teslim ediliyor…' : 'Evet, teslim et'}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
