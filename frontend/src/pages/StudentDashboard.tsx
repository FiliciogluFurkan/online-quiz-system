import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Search, SlidersHorizontal, X, Calendar, Clock, User } from 'lucide-react';
import api from '../api/axios';
import type { Exam } from '../types';
import {
  tokens, PageShell, Kicker, Stat, SectionHeader, Btn,
  scoreLabel, formatTrDateShort,
} from '../components/academic-ui';

interface StudentExam {
  id: number;
  exam: Exam;
  score: number;
  maxScore: number;
  status: string;
  submittedAt: string;
}

type ExamState = 'live' | 'upcoming' | 'available' | 'ended';

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

function deadlineLabel(exam: Exam): string {
  if (!exam.endTime) return '—';
  const end = new Date(exam.endTime);
  const diffMs = end.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0)
    return end.toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Bugün';
  return `${diffDays} gün kaldı`;
}

function ExamModal({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const navigate = useNavigate();
  const state = getExamState(exam);
  const isLive = state === 'live' || state === 'available';

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16, maxWidth: 560, width: '100%', padding: 32,
          position: 'relative', maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20, background: 'transparent',
            border: 'none', cursor: 'pointer', padding: 8, color: tokens.subtle,
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: 24 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 999,
              background: isLive ? tokens.indigoSoft : '#f4f4f7',
              color: isLive ? tokens.indigo : tokens.muted,
              fontSize: 12, fontWeight: 600,
              border: `1px solid ${isLive ? tokens.indigoBorder : '#e7e7ec'}`,
              marginBottom: 16,
            }}
          >
            <Calendar size={13} />
            {isLive ? 'Sınav Açık' : 'Yaklaşan Sınav'}
          </span>

          <h2
            style={{
              margin: 0, fontFamily: tokens.serif, fontSize: 28, fontWeight: 400,
              color: tokens.ink, letterSpacing: '-0.02em', marginBottom: 12,
            }}
          >
            {exam.title}
          </h2>

          {exam.instructor?.fullName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tokens.subtle, fontSize: 14 }}>
              <User size={14} />
              {exam.instructor.fullName}
            </div>
          )}
        </div>

        {exam.description && (
          <div style={{ padding: 16, background: tokens.ivory, borderRadius: 10, marginBottom: 24 }}>
            <div style={{
              fontFamily: tokens.mono, fontSize: 10, color: tokens.subtle,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
            }}>Açıklama</div>
            <p style={{ margin: 0, fontSize: 14, color: tokens.muted, lineHeight: 1.6 }}>
              {exam.description}
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ padding: 16, background: '#fafafa', borderRadius: 10, border: `1px solid ${tokens.hairline}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Clock size={14} style={{ color: tokens.subtle }} />
              <span style={{
                fontFamily: tokens.mono, fontSize: 10, color: tokens.subtle,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>Süre</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: tokens.ink }}>
              {exam.duration} dakika
            </div>
          </div>

          <div style={{ padding: 16, background: '#fafafa', borderRadius: 10, border: `1px solid ${tokens.hairline}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Calendar size={14} style={{ color: tokens.subtle }} />
              <span style={{
                fontFamily: tokens.mono, fontSize: 10, color: tokens.subtle,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>Son Tarih</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: tokens.ink }}>
              {deadlineLabel(exam)}
            </div>
          </div>
        </div>

        {exam.startTime && (
          <div style={{
            padding: 16, background: '#f0f9ff', border: '1px solid #bfdbfe',
            borderRadius: 10, marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>
              <strong>Başlangıç:</strong>{' '}
              {new Date(exam.startTime).toLocaleString('tr-TR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </div>
            {exam.endTime && (
              <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.5, marginTop: 4 }}>
                <strong>Bitiş:</strong>{' '}
                {new Date(exam.endTime).toLocaleString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <Btn variant="outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
            Kapat
          </Btn>
          {isLive && (
            <Btn
              variant="primary"
              onClick={() => {
                onClose();
                navigate(`/student/exam/${exam.id}`);
              }}
              iconR={<ArrowRight size={15} />}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Sınava Başla
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function AvailableCard({ exam, onStart }: { exam: Exam; onStart: () => void }) {
  const state = getExamState(exam);
  const isLive = state === 'live' || state === 'available';
  const isEnded = state === 'ended';

  return (
    <article style={{
      background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14,
      padding: 22, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative',
      opacity: isEnded ? 0.6 : 1,
    }}>
      {isLive && (
        <div style={{
          position: 'absolute', top: -1, left: 22, right: 22, height: 2,
          background: 'linear-gradient(90deg, #4f46e5, #818cf8 60%, transparent)', borderRadius: 2,
        }} />
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: 0, fontFamily: tokens.serif, fontSize: 20, lineHeight: 1.25,
            color: tokens.ink, fontWeight: 400, letterSpacing: '-0.01em',
          }}>{exam.title}</h3>
          {exam.instructor?.fullName && (
            <div style={{
              marginTop: 6, fontSize: 12, color: tokens.subtle,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
              </svg>
              {exam.instructor.fullName}
            </div>
          )}
        </div>

        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 9px', borderRadius: 999,
          background: isEnded ? '#fee2e2' : isLive ? tokens.indigoSoft : '#f4f4f7',
          color: isEnded ? '#991b1b' : isLive ? tokens.indigo : tokens.muted,
          fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
          border: `1px solid ${isEnded ? '#fecaca' : isLive ? tokens.indigoBorder : '#e7e7ec'}`,
          flexShrink: 0,
        }}>
          {isEnded ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : isLive ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />
            </svg>
          )}
          {isEnded ? 'Süresi Doldu' : isLive ? 'Açık' : 'Yaklaşan'}
        </span>
      </header>

      {exam.description && (
        <p style={{ margin: 0, fontSize: 13, color: tokens.muted, lineHeight: 1.55 }}>
          {exam.description}
        </p>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        borderTop: `1px solid ${tokens.hairlineSoft}`, borderBottom: `1px solid ${tokens.hairlineSoft}`,
        padding: '12px 0',
      }}>
        {[
          ['Süre', `${exam.duration} dk`],
          ['Son', deadlineLabel(exam)],
        ].map(([k, v], i) => (
          <div key={k} style={{
            padding: '0 14px',
            borderLeft: i === 0 ? 'none' : `1px solid ${tokens.hairlineSoft}`,
          }}>
            <div style={{
              fontFamily: tokens.mono, fontSize: 10, color: tokens.subtle,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{k}</div>
            <div style={{ fontSize: 14, color: '#2a2a36', fontWeight: 500, marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>

      <Btn
        variant={isEnded ? 'outline' : isLive ? 'primary' : 'outline'}
        onClick={onStart}
        iconR={<ArrowRight size={15} />}
        style={{ 
          width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: 14,
          opacity: isEnded ? 0.5 : 1,
          cursor: isEnded ? 'not-allowed' : 'pointer',
        }}
        disabled={isEnded}
      >
        {isEnded ? 'Süre Doldu' : isLive ? 'Sınava Başla' : 'Sınav Detayı'}
      </Btn>
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
      padding: '18px 22px', background: tokens.ivory,
      border: `1px solid ${tokens.hairline}`, borderRadius: 12,
    }}>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 12, color: tokens.subtle }}>{formatTrDateShort(result.submittedAt)}</span>
        <h4 style={{
          margin: 0, fontFamily: tokens.serif, fontSize: 18, fontWeight: 400,
          color: '#2a2a36', letterSpacing: '-0.01em',
        }}>{result.exam.title}</h4>
      </div>

      <div style={{ textAlign: 'right' }}>
        {graded && result.score != null ? (
          <>
            <div style={{
              fontFamily: tokens.serif, fontSize: 32, lineHeight: 1,
              color: tokens.ink, letterSpacing: '-0.02em',
            }}>
              {result.score}
              <span style={{ fontSize: 16, color: tokens.subtle }}> / {maxScore}</span>
            </div>
            {perf && (
              <div style={{
                fontFamily: tokens.mono, fontSize: 10.5, color: perf.color,
                marginTop: 4, fontWeight: 600, letterSpacing: '0.04em',
              }}>{perf.text}</div>
            )}
          </>
        ) : (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 999,
            background: '#fff', border: '1px solid #e7e7ec',
            color: tokens.muted, fontSize: 12, fontWeight: 500,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            Değerlendiriliyor
          </span>
        )}
      </div>

      <Btn variant="ghost" onClick={onView} iconR={<ArrowRight size={13} style={{ opacity: 0.5 }} />}>
        İncele
      </Btn>
    </article>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [expiredExams, setExpiredExams] = useState<Exam[]>([]);
  const [completedResults, setCompletedResults] = useState<StudentExam[]>([]);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

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

      // Tamamlanmamış sınavları ayır
      const notDoneExams = exams.filter(e => !doneIds.has(e.id));
      
      // Süresi dolmamış ve dolmuş olarak ayır
      const active = notDoneExams.filter(e => getExamState(e) !== 'ended');
      const expired = notDoneExams.filter(e => getExamState(e) === 'ended');

      setAvailableExams(active);
      setExpiredExams(expired);
      setCompletedResults(results.filter(r => ['SUBMITTED', 'GRADED'].includes(r.status)));
    } catch (err) {
      console.error('Error loading dashboard data', err);
    }
  };

  const filteredAvailable = availableExams.filter(e =>
    `${e.title} ${e.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredExpired = expiredExams.filter(e =>
    `${e.title} ${e.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const gradedResults = completedResults.filter(r => r.status === 'GRADED' && r.score != null);
  const avgScore = gradedResults.length > 0
    ? Math.round(gradedResults.reduce((s, r) => s + r.score, 0) / gradedResults.length)
    : null;

  const liveCount = availableExams.filter(e => {
    const s = getExamState(e);
    return s === 'live' || s === 'available';
  }).length;
  const upcomingCount = availableExams.filter(e => getExamState(e) === 'upcoming').length;

  const handleExamClick = (exam: Exam) => {
    const state = getExamState(exam);
    if (state === 'ended') {
      // Süresi dolmuş sınavlara tıklanmasın
      return;
    }
    if (state === 'upcoming') {
      setSelectedExam(exam);
    } else {
      navigate(`/student/exam/${exam.id}`);
    }
  };

  return (
    <PageShell>
      {selectedExam && (
        <ExamModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
      )}

      <section style={{ marginBottom: 36 }}>
        <Kicker>Bahar Dönemi · 2025–26</Kicker>
        <div style={{ marginTop: 8 }}>
          <h1 style={{
            margin: 0, fontFamily: tokens.serif, fontSize: 52, fontWeight: 400,
            color: tokens.ink, letterSpacing: '-0.025em', lineHeight: 1,
          }}>Sınavlarım<span style={{ color: tokens.indigo }}>.</span></h1>
        </div>
        <p style={{
          margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
          fontSize: 15.5, lineHeight: 1.6,
        }}>
          Bu dönem için yayında olan tüm sınavlar ve geçmiş sonuçların.
          Yaklaşan sınavları kaçırmamak için sınav detayını inceleyebilirsin.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
        <Stat
          label="Mevcut"
          value={String(availableExams.length).padStart(2, '0')}
          sub={`${liveCount} açık · ${upcomingCount} yaklaşan`}
          accent={tokens.indigo}
        />
        <Stat
          label="Tamamlanan"
          value={String(completedResults.length).padStart(2, '0')}
          sub="Bu dönem"
        />
        <Stat
          label="Süresi Geçen"
          value={String(expiredExams.length).padStart(2, '0')}
          sub="Tamamlanamayan sınavlar"
        />
      </section>

      <section style={{ marginBottom: 56 }}>
        <SectionHeader
          kicker="01 — Aktif"
          title="Mevcut Sınavlar"
          count={filteredAvailable.length}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 10,
                color: tokens.subtle, minWidth: 260,
              }}>
                <Search size={15} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Sınav ara…"
                  style={{
                    border: 'none', outline: 'none', background: 'transparent',
                    flex: 1, color: tokens.ink, fontFamily: 'inherit', fontSize: 13,
                  }}
                />
              </div>
              <Btn icon={<SlidersHorizontal size={14} />}>Filtrele</Btn>
            </div>
          }
        />

        {filteredAvailable.length === 0 ? (
          <div style={{
            padding: '64px 24px', textAlign: 'center',
            background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)',
              margin: '0 auto 20px',
              display: 'grid', placeItems: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={tokens.indigo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 style={{
              margin: '0 0 8px', fontFamily: tokens.serif,
              fontSize: 22, fontWeight: 400, color: tokens.ink,
            }}>
              {search ? 'Sınav bulunamadı' : 'Şu an aktif bir sınav yok'}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: tokens.muted, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
              {search
                ? 'Farklı bir arama terimi deneyin veya filtreyi temizleyin.'
                : 'Eğitmeniniz yeni bir sınav yayınladığında burada görünecek.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filteredAvailable.map(exam => (
              <AvailableCard key={exam.id} exam={exam} onStart={() => handleExamClick(exam)} />
            ))}
          </div>
        )}
      </section>

      {filteredExpired.length > 0 && (
        <section style={{ marginBottom: 56 }}>
          <SectionHeader
            kicker="02 — Süresi Geçen"
            title="Tamamlanamayan Sınavlar"
            count={filteredExpired.length}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filteredExpired.map(exam => (
              <AvailableCard key={exam.id} exam={exam} onStart={() => {}} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader
          kicker="03 — Geçmiş"
          title="Tamamlanan Sınavlar"
          count={completedResults.length}
          action={
            <Btn variant="quiet" onClick={() => navigate('/student/my-results')}
              iconR={<ArrowRight size={13} />}>
              Tümünü gör
            </Btn>
          }
        />

        {completedResults.length === 0 ? (
          <div style={{
            padding: '32px 24px', textAlign: 'center',
            background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 12,
            color: tokens.subtle, fontSize: 13.5,
          }}>
            Henüz tamamlanan sınav bulunmuyor.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completedResults.slice(0, 5).map(result => (
              <CompletedRow
                key={result.id}
                result={result}
                onView={() => navigate(`/student/result/${result.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <footer style={{
        marginTop: 64, paddingTop: 24, borderTop: `1px solid ${tokens.hairline}`,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: tokens.mono, fontSize: 11, color: tokens.subtle, letterSpacing: '0.06em',
      }}>
        <span>ONLINE QUIZ SYSTEM · AKADEMİK</span>
        <span>Son güncelleme · {new Date().toLocaleString('tr-TR', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}</span>
      </footer>
    </PageShell>
  );
}
