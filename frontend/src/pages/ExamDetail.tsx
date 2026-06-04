import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Eye, BarChart3, FileText, Send, Pencil, MoreVertical, CheckCircle2, SlidersHorizontal, Globe, Users } from 'lucide-react';
import api from '../api/axios';
import type { Exam, Question, ClassroomRow, ExamVisibility } from '../types';
import { tokens, formatTrDate, Btn } from '../components/academic-ui';

interface ExamQuestion {
  id: number;
  question: Question;
  orderIndex: number;
}

function getQuestionTypeLabel(type: string): string {
  if (type === 'MULTIPLE_CHOICE') return 'Çoktan Seçmeli';
  if (type === 'TRUE_FALSE') return 'Doğru / Yanlış';
  return 'Kısa Cevap';
}

type Opt = { label: string; text: string; correct: boolean };

function isCorrectMC(letter: string, text: string, correctAnswer?: string): boolean {
  const ca = (correctAnswer || '').trim().toLowerCase();
  if (!ca) return false;
  const L = letter.toLowerCase();
  if (ca === L || ca === `${L})` || ca === `${L}.` || ca === `${L}-`) return true;
  if (ca.startsWith(`${L})`) || ca.startsWith(`${L}.`) || ca.startsWith(`${L} `)) return true;
  const t = text.trim().toLowerCase();
  if (t && (ca === t || ca.includes(t) || t.includes(ca))) return true;
  return false;
}

function buildOptions(q: Question): Opt[] {
  if (q.type === 'TRUE_FALSE') {
    const ca = (q.correctAnswer || '').trim().toLowerCase();
    return [
      { label: 'D', text: 'Doğru', correct: ['true', 'doğru', 'd', '1', 'evet'].includes(ca) },
      { label: 'Y', text: 'Yanlış', correct: ['false', 'yanlış', 'y', '0', 'hayır'].includes(ca) },
    ];
  }
  if (q.type === 'SHORT_ANSWER') {
    return q.correctAnswer ? [{ label: '✓', text: q.correctAnswer, correct: true }] : [];
  }
  const lines = (q.options || '').split('\n').map(s => s.trim()).filter(Boolean);
  return lines.map((raw, i) => {
    const letter = String.fromCharCode(65 + i);
    const text = raw.replace(/^\s*[A-Za-z]\s*[).\-:]\s*/, '').trim() || raw;
    return { label: letter, text, correct: isCorrectMC(letter, text, q.correctAnswer) };
  });
}

function AssignmentPanel({ examId }: { examId: string }) {
  const [visibility, setVisibility] = useState<ExamVisibility>('PUBLIC');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [classes, setClasses] = useState<ClassroomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get(`/exams/${examId}/assignments`),
      api.get('/classrooms'),
    ]).then(([assignRes, classRes]) => {
      if (assignRes.status === 'fulfilled') {
        setVisibility(assignRes.value.data.visibility === 'CLASSES' ? 'CLASSES' : 'PUBLIC');
        const ids = (assignRes.value.data.classes ?? []).map((c: { id: number }) => c.id);
        setSelected(new Set(ids));
      }
      if (classRes.status === 'fulfilled') setClasses(classRes.value.data);
      setLoading(false);
    });
  }, [examId]);

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
    setSavedAt(false);
  };

  const save = async () => {
    if (saving) return;
    if (visibility === 'CLASSES' && selected.size === 0) {
      alert('Sınıf bazlı görünürlük için en az bir sınıf seçmelisin.');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/exams/${examId}/assignments`, {
        visibility,
        classIds: visibility === 'CLASSES' ? Array.from(selected) : [],
      });
      setSavedAt(true);
      setTimeout(() => setSavedAt(false), 2000);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Görünürlük kaydedilirken hata oluştu.';
      alert(msg);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const opt = (val: ExamVisibility, icon: React.ReactNode, title: string, desc: string) => {
    const sel = visibility === val;
    return (
      <div onClick={() => { setVisibility(val); setSavedAt(false); }}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 10, border: sel ? `2px solid ${tokens.navy}` : `1px solid ${tokens.hairline}`, background: sel ? '#f0f3ff' : tokens.card }}>
        <span style={{ color: sel ? tokens.navy : tokens.subtle, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink, marginBottom: 3 }}>{title}</div>
          <div style={{ fontSize: 13, color: tokens.muted, lineHeight: 1.5 }}>{desc}</div>
        </div>
        <CheckCircle2 size={20} style={{ color: sel ? tokens.navy : tokens.hairline, flexShrink: 0 }} />
      </div>
    );
  };

  return (
    <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 16, padding: 28, marginBottom: 32, boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${tokens.hairline}` }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, background: '#e5eeff', color: tokens.navy, display: 'grid', placeItems: 'center' }}><Globe size={20} /></span>
        <div>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Görünürlük & Sınıflar</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: tokens.muted }}>Bu sınava kimlerin erişebileceğini belirle.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ color: tokens.muted, padding: 12 }}>Yükleniyor…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {opt('PUBLIC', <Globe size={18} />, 'Herkese Açık', 'Tüm öğrenciler bu sınavı görebilir ve girebilir.')}
            {opt('CLASSES', <Users size={18} />, 'Seçili Sınıflara', 'Yalnızca atadığın sınıflardaki öğrenciler erişir.')}
          </div>

          {visibility === 'CLASSES' && (
            <div style={{ marginTop: 18 }}>
              {classes.length === 0 ? (
                <div style={{ padding: '16px 18px', background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 10, fontSize: 13.5, color: tokens.muted }}>
                  Henüz sınıfın yok. Önce <strong>Sınıflarım</strong> sayfasından sınıf oluştur.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                  {classes.map(({ classroom, enrolledCount }) => {
                    const sel = selected.has(classroom.id);
                    return (
                      <div key={classroom.id} onClick={() => toggle(classroom.id)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, border: sel ? `2px solid ${tokens.navy}` : `1px solid ${tokens.hairline}`, background: sel ? '#f0f3ff' : tokens.card }}>
                        <span style={{ width: 20, height: 20, borderRadius: 6, border: sel ? 'none' : `1.5px solid ${tokens.subtle}`, background: sel ? tokens.navy : 'transparent', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          {sel && <CheckCircle2 size={14} />}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: tokens.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{classroom.name}</div>
                          <div style={{ fontSize: 12, color: tokens.subtle }}>{enrolledCount} öğrenci</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20 }}>
            <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Kaydediliyor…' : 'Görünürlüğü Kaydet'}</Btn>
            {savedAt && <span style={{ fontSize: 13, color: tokens.good, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={15} />Kaydedildi</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/exams/${id}`).then(res => setExam(res.data)).catch(console.error);
    loadQuestions();
  }, [id]);

  const loadQuestions = () => {
    api.get(`/exam-questions/exam/${id}`).then(res => setExamQuestions(res.data)).catch(console.error);
  };

  const totalPoints = useMemo(
    () => examQuestions.reduce((sum, item) => sum + (item.question.points || 0), 0),
    [examQuestions]
  );

  const handlePublish = async () => {
    if (!exam || busy) return;
    if (examQuestions.length === 0) { alert('Sorusu olmayan sınav yayınlanamaz. Önce soru ekle.'); return; }
    if (!window.confirm('Sınavı yayınlamak istediğine emin misin? Yayınladıktan sonra öğrenciler katılabilir.')) return;
    setBusy(true);
    try {
      await api.put(`/exams/${id}`, { ...exam, published: true });
      navigate('/instructor');
    } catch (error) {
      const data = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      const msg = data?.error || data?.message || 'Sınav yayınlanırken hata oluştu.';
      alert(msg);
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const handleUnpublish = async () => {
    if (!exam || busy) return;
    setBusy(true);
    try {
      await api.put(`/exams/${id}`, { ...exam, published: false });
      setExam({ ...exam, published: false });
    } catch (error) {
      alert('Yayından kaldırılırken hata oluştu.');
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  if (!exam) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: tokens.bg, color: tokens.muted }}>Yükleniyor…</div>;
  }

  const secBtn = (icon: ReactNode, label: string, onClick: () => void) => (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10,
      border: `1px solid ${tokens.hairline}`, background: tokens.card, color: tokens.navy,
      fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    }}>{icon}{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 40px 64px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: tokens.muted, marginBottom: 22 }}>
          <span onClick={() => navigate('/instructor')} style={{ cursor: 'pointer' }}>Eğitmen</span>
          <span style={{ color: tokens.subtle }}>/</span>
          <span onClick={() => navigate('/instructor')} style={{ cursor: 'pointer' }}>Sınavlar</span>
          <span style={{ color: tokens.subtle }}>/</span>
          <span style={{ color: tokens.ink, fontWeight: 600 }}>{exam.title}</span>
        </div>

        {/* Header card */}
        <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ padding: '4px 10px', borderRadius: 6, background: exam.published ? tokens.navy : '#e2e8f0', color: exam.published ? '#fff' : tokens.muted, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
                  {exam.published ? 'YAYINDA' : 'TASLAK'}
                </span>
                <span style={{ fontSize: 13, color: tokens.subtle, fontWeight: 600 }}>#{String(exam.id).padStart(3, '0')}</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>{exam.title}</h1>
              <p style={{ margin: '10px 0 0', maxWidth: 680, color: tokens.muted, fontSize: 15, lineHeight: 1.6 }}>
                {exam.description || 'Bu sınav için henüz açıklama eklenmemiş.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {exam.published ? (
                <button onClick={handleUnpublish} disabled={busy} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#ffdad6', color: '#93000a', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {busy ? 'İşleniyor…' : 'Yayından Kaldır'}
                </button>
              ) : (
                <button onClick={handlePublish} disabled={busy || examQuestions.length === 0} title={examQuestions.length === 0 ? 'Önce soru ekle' : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: 'none', background: tokens.navy, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: examQuestions.length === 0 ? 0.55 : 1 }}>
                  <Send size={15} />{busy ? 'Yayınlanıyor…' : 'Yayınla'}
                </button>
              )}
              <button onClick={() => navigate(`/instructor/exam/${id}/edit`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: `1px solid ${tokens.hairline}`, background: tokens.card, color: tokens.ink, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Pencil size={15} />Düzenle
              </button>
            </div>
          </div>

          {/* Meta box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 12, padding: 18 }}>
            {[
              ['Süre', `${exam.duration} dk`],
              ['Soru', String(examQuestions.length)],
              ['Başlangıç', formatTrDate(exam.startTime)],
              ['Bitiş', formatTrDate(exam.endTime)],
            ].map(([k, v], i) => (
              <div key={k} style={{ paddingLeft: i === 0 ? 0 : 18, borderLeft: i === 0 ? 'none' : `1px solid ${tokens.hairline}` }}>
                <div style={{ fontSize: 11, color: tokens.subtle, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{k}</div>
                <div style={{ fontSize: i < 2 ? 22 : 14, fontWeight: i < 2 ? 700 : 600, color: tokens.ink }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Secondary actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22, paddingTop: 22, borderTop: `1px solid ${tokens.hairline}` }}>
            <button onClick={() => navigate(`/instructor/exam/${id}/add-questions`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#e5eeff', color: tokens.navy, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Plus size={16} />Soru Ekle
            </button>
            {secBtn(<Eye size={16} />, 'Önizle', () => navigate(`/instructor/exam/${id}/preview`))}
            {secBtn(<FileText size={16} />, 'Sonuçlar', () => navigate(`/instructor/exam/${id}/results`))}
            {secBtn(<BarChart3 size={16} />, 'İstatistikler', () => navigate(`/instructor/exam/${id}/statistics`))}
          </div>
        </div>

        {/* Görünürlük & Sınıflar */}
        <AssignmentPanel examId={String(id)} />

        {/* Questions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Sorular <span style={{ color: tokens.subtle, fontWeight: 600 }}>({examQuestions.length})</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: tokens.muted }}>Toplam <strong style={{ color: tokens.ink }}>{totalPoints}</strong> puan</span>
            <button title="Filtrele" style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${tokens.hairline}`, background: tokens.card, color: tokens.muted, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><SlidersHorizontal size={17} /></button>
          </div>
        </div>

        {examQuestions.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>Henüz soru eklenmemiş</div>
            <div style={{ fontSize: 13.5, color: tokens.subtle, marginBottom: 18 }}>Bu sınavı yayınlamadan önce soru ekleyerek içeriği tamamla.</div>
            <button onClick={() => navigate(`/instructor/exam/${id}/add-questions`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 10, border: 'none', background: tokens.navy, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Plus size={16} />İlk Soruyu Ekle
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {examQuestions.map((eq, idx) => {
              const opts = buildOptions(eq.question);
              return (
                <div key={eq.id} style={{ position: 'relative', overflow: 'hidden', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 24, boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: tokens.indigo }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: tokens.indigo, width: 30 }}>{String(idx + 1).padStart(2, '0')}</span>
                      <span style={{ padding: '4px 10px', borderRadius: 6, background: '#e5eeff', color: tokens.text, fontSize: 12, fontWeight: 600 }}>{getQuestionTypeLabel(eq.question.type)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${tokens.hairline}`, fontSize: 12, fontWeight: 600, color: tokens.text }}>{eq.question.points} Puan</span>
                      <button style={{ border: 'none', background: 'transparent', color: tokens.subtle, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><MoreVertical size={18} /></button>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 16px 42px', fontSize: 17, lineHeight: 1.5, color: tokens.ink }}>{eq.question.questionText}</p>
                  {opts.length > 0 && (
                    <div style={{ marginLeft: 42, display: 'grid', gridTemplateColumns: eq.question.type === 'SHORT_ANSWER' ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
                      {opts.map(opt => (
                        <div key={opt.label} style={{
                          position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 10,
                          border: opt.correct ? `2px solid ${tokens.navy}` : `1px solid ${tokens.hairline}`,
                          background: opt.correct ? '#dce1ff' : tokens.card,
                        }}>
                          <span style={{ fontWeight: 700, color: tokens.navy, width: 18, flexShrink: 0 }}>{opt.label}</span>
                          <span style={{ fontSize: 14, color: opt.correct ? '#264191' : tokens.ink, flex: 1 }}>{opt.text}</span>
                          {opt.correct && <CheckCircle2 size={16} style={{ position: 'absolute', right: 12, top: 12, color: tokens.navy }} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
