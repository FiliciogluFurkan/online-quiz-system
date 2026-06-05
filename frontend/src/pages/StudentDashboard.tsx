import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Search, SlidersHorizontal, ClipboardList, CheckCircle2, BarChart3, Clock, Calendar, ClipboardCheck } from 'lucide-react';
import api from '../api/axios';
import type { Exam } from '../types';
import { tokens, Btn, scoreLabel, formatTrDateShort } from '../components/academic-ui';

interface StudentExam {
  id: number;
  exam: Exam;
  score: number;
  maxScore: number;
  status: string;
  submittedAt: string;
}

type ExamState = 'live' | 'upcoming' | 'ended' | 'available';

function getExamState(exam: Exam): ExamState {
  const now = new Date();
  const start = exam.startTime ? new Date(exam.startTime) : null;
  const end = exam.endTime ? new Date(exam.endTime) : null;
  if (end && now > end) return 'ended';
  if (start && end) {
    if (now >= start && now <= end) return 'live';
    if (now < start) return 'upcoming';
  }
  return 'available';
}

function fmtDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StudentStat({ icon, accent, label, value, caption }: {
  icon: ReactNode; accent: string; label: string; value: string; caption?: string;
}) {
  return (
    <div style={{
      background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14,
      padding: 22, boxShadow: '0 4px 12px rgba(30,58,138,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 9, background: `${accent}14`, color: accent, display: 'grid', placeItems: 'center' }}>{icon}</span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: tokens.muted }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 42, fontWeight: 800, color: tokens.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</span>
        {caption && <span style={{ fontSize: 13, color: tokens.subtle }}>{caption}</span>}
      </div>
    </div>
  );
}

function AvailableCard({ exam, onStart }: { exam: Exam; onStart: () => void }) {
  const state = getExamState(exam);
  const isEnded = state === 'ended';
  const isLive = state === 'live' || state === 'available';
  const badge = isEnded
    ? { text: 'Süresi Doldu', bg: '#fde8e8', fg: '#93000a', dot: '#c0392b' }
    : isLive
    ? { text: 'Açık', bg: '#dce1ff', fg: '#00164e', dot: tokens.navy }
    : { text: 'Yaklaşan', bg: '#eef1f7', fg: tokens.muted, dot: tokens.subtle };

  return (
    <article style={{
      background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      boxShadow: '0 4px 12px rgba(30,58,138,0.04)',
    }}>
      <div style={{ height: 4, background: isEnded ? tokens.subtle : isLive ? tokens.navy : tokens.subtle }} />
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.3, color: tokens.ink }}>{exam.title}</h3>
          <span style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700,
            background: badge.bg, color: badge.fg,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.dot }} />
            {badge.text}
          </span>
        </div>

        {exam.description && (
          <p style={{
            margin: 0, fontSize: 13, color: tokens.muted, lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>{exam.description}</p>
        )}

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          padding: '14px 0', borderTop: `1px solid ${tokens.hairlineSoft}`, marginTop: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 12, color: tokens.subtle, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Calendar size={14} />Başlangıç</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: tokens.ink }}>{fmtDateTime(exam.startTime)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 12, color: tokens.subtle, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Calendar size={14} />Bitiş</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: tokens.ink }}>{fmtDateTime(exam.endTime)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 12, color: tokens.subtle, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={14} />Süre</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: tokens.ink }}>{exam.duration} dk</span>
          </div>
        </div>

        {isLive ? (
          <Btn variant="primary" onClick={onStart} iconR={<ArrowRight size={15} />}
            style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: 14 }}>
            Sınava Başla
          </Btn>
        ) : (
          <div style={{
            width: '100%', textAlign: 'center', padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${tokens.hairline}`, background: tokens.ivory,
            color: tokens.subtle, fontSize: 14, fontWeight: 600,
          }}>
            {isEnded ? 'Süresi Doldu' : 'Sınav henüz başlamadı'}
          </div>
        )}
      </div>
    </article>
  );
}

function CompletedRow({ result, onView }: { result: StudentExam; onView: () => void }) {
  const graded = result.status === 'GRADED';
  const maxScore = result.maxScore ?? 100;
  const pct = graded && result.score != null ? Math.round((result.score / maxScore) * 100) : null;
  const perf = pct != null ? scoreLabel(pct) : null;

  return (
    <article style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 24,
      padding: '18px 22px', background: tokens.card,
      border: `1px solid ${tokens.hairline}`, borderRadius: 12,
    }}>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, color: tokens.subtle }}>{formatTrDateShort(result.submittedAt)}</span>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.ink }}>{result.exam.title}</h4>
      </div>
      <div style={{ textAlign: 'right' }}>
        {graded && result.score != null ? (
          <>
            <div style={{ fontSize: 28, fontWeight: 800, color: tokens.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {result.score}<span style={{ fontSize: 15, color: tokens.subtle, fontWeight: 600 }}> / {maxScore}</span>
            </div>
            {perf && <div style={{ fontSize: 11, color: perf.color, marginTop: 4, fontWeight: 700 }}>{perf.text}</div>}
          </>
        ) : (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999,
            background: tokens.ivory, border: `1px solid ${tokens.hairline}`, color: tokens.muted, fontSize: 12, fontWeight: 600,
          }}>Değerlendiriliyor</span>
        )}
      </div>
      <Btn variant="ghost" onClick={onView} iconR={<ArrowRight size={13} style={{ opacity: 0.5 }} />}>İncele</Btn>
    </article>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [completedResults, setCompletedResults] = useState<StudentExam[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [location.search]);

  const loadData = async () => {
    try {
      const [examsRes, resultsRes] = await Promise.allSettled([
        api.get('/exams/published'),
        api.get('/results/my-results'),
      ]);

      let exams: Exam[] = [];
      if (examsRes.status === 'fulfilled') exams = examsRes.value.data;

      let results: StudentExam[] = [];
      if (resultsRes.status === 'fulfilled') results = resultsRes.value.data;

      const doneIds = new Set<number>(
        results.filter(r => ['SUBMITTED', 'GRADED'].includes(r.status)).map(r => r.exam.id)
      );

      setAvailableExams(exams.filter(e => !doneIds.has(e.id)));
      setCompletedResults(results.filter(r => ['SUBMITTED', 'GRADED'].includes(r.status)));
    } catch (err) {
      console.error('Error loading dashboard data', err);
    }
  };

  const filteredAvailable = availableExams.filter(e =>
    `${e.title} ${e.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const gradedResults = completedResults.filter(r => r.status === 'GRADED' && r.score != null);
  // Sınavların toplam puanları farklı olabileceği için ortalamayı yüzde olarak hesapla
  const avgScore = gradedResults.length > 0
    ? Math.round(gradedResults.reduce((s, r) => s + (r.score / (r.maxScore || 100)) * 100, 0) / gradedResults.length)
    : null;

  const liveCount = availableExams.filter(e => {
    const s = getExamState(e);
    return s === 'live' || s === 'available';
  }).length;
  const upcomingCount = availableExams.filter(e => getExamState(e) === 'upcoming').length;

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 40px 64px' }}>
        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>Sınavlarım</h1>
          <p style={{ margin: '8px 0 0', color: tokens.muted, fontSize: 16 }}>
            Bu dönem yayında olan sınavlar ve geçmiş sonuçların.
          </p>
        </header>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
          <StudentStat icon={<ClipboardList size={18} />} accent={tokens.navy} label="Mevcut Sınavlar"
            value={String(availableExams.length)} caption={`${liveCount} açık · ${upcomingCount} yaklaşan`} />
          <StudentStat icon={<CheckCircle2 size={18} />} accent={tokens.indigo} label="Tamamlanan"
            value={String(completedResults.length)} caption="Bu dönem" />
          <StudentStat icon={<BarChart3 size={18} />} accent="#0ea5e9" label="Ortalama Puan"
            value={avgScore != null ? String(avgScore) : '—'}
            caption={gradedResults.length > 0 ? `/ 100` : 'Henüz değerlendirilmedi'} />
        </div>

        {/* Mevcut Sınavlar */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              Mevcut Sınavlar <span style={{ color: tokens.subtle, fontWeight: 600 }}>({filteredAvailable.length})</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 10, minWidth: 240,
              }}>
                <Search size={15} style={{ color: tokens.subtle }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sınav ara…"
                  style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, color: tokens.ink, fontFamily: 'inherit', fontSize: 13 }} />
              </div>
              <Btn icon={<SlidersHorizontal size={14} />}>Filtrele</Btn>
            </div>
          </div>

          {filteredAvailable.length === 0 ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center', background: tokens.card,
              border: `1px solid ${tokens.hairline}`, borderRadius: 14, color: tokens.subtle,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>Sınav bulunamadı</div>
              <div style={{ fontSize: 13.5 }}>{search ? 'Farklı bir arama terimi dene.' : 'Şu an aktif bir sınav yok.'}</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {filteredAvailable.map(exam => (
                <AvailableCard key={exam.id} exam={exam} onStart={() => navigate(`/student/exam/${exam.id}`)} />
              ))}
            </div>
          )}
        </section>

        {/* Tamamlanan Sınavlar */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              Tamamlanan Sınavlar <span style={{ color: tokens.subtle, fontWeight: 600 }}>({completedResults.length})</span>
            </h2>
            {completedResults.length > 0 && (
              <Btn variant="quiet" onClick={() => navigate('/student/my-results')} iconR={<ArrowRight size={13} />}>Tümünü gör</Btn>
            )}
          </div>

          {completedResults.length === 0 ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center', background: tokens.card,
              border: `1px dashed #cdd5e5`, borderRadius: 14,
            }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: tokens.ivory, color: tokens.subtle, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                <ClipboardCheck size={24} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>Gösterilecek Sonuç Yok</div>
              <div style={{ fontSize: 13.5, color: tokens.subtle }}>Henüz tamamlanan sınav bulunmuyor.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {completedResults.slice(0, 5).map(result => (
                <CompletedRow key={result.id} result={result} onView={() => navigate(`/student/result/${result.id}`)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
