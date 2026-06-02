import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import {
  tokens, PageShell, Crumbs, HeroTitle, Kicker, Stat, SectionHeader, Btn,
  scoreLabel, formatTrDateShort,
} from '../components/academic-ui';

interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number;
}

interface StudentExam {
  id: number;
  exam: Exam;
  score: number;
  maxScore?: number;
  status: string;
  startedAt: string;
  submittedAt: string;
}

type FilterKey = 'all' | 'graded' | 'submitted';

export default function MyResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState<StudentExam[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    api.get('/results/my-results')
      .then(res => {
        const completed = res.data.filter(
          (r: StudentExam) => r.status === 'GRADED' || r.status === 'SUBMITTED'
        );
        setResults(completed);
      })
      .catch(err => {
        console.error('Error loading results:', err);
        alert('Sonuçlar yüklenirken hata oluştu!');
      });
  }, []);

  const graded = useMemo(() => results.filter(r => r.status === 'GRADED'), [results]);
  const pending = useMemo(() => results.filter(r => r.status === 'SUBMITTED'), [results]);

  const avg = useMemo(() => {
    if (graded.length === 0) return null;
    return Math.round(graded.reduce((s, r) => s + r.score, 0) / graded.length);
  }, [graded]);

  const best = useMemo(() => {
    if (graded.length === 0) return null;
    return Math.max(...graded.map(r => r.score));
  }, [graded]);

  const visible = useMemo(() => {
    if (filter === 'graded') return graded;
    if (filter === 'submitted') return pending;
    return results;
  }, [filter, results, graded, pending]);

  return (
    <PageShell>
      <Crumbs items={['Sınavlarım', 'Geçmiş', 'Tüm Sonuçlar']} />

      <section style={{ marginBottom: 36 }}>
        <Kicker>Tüm dönemler</Kicker>
        <div style={{ marginTop: 8 }}>
          <HeroTitle>Sınav Geçmişim</HeroTitle>
        </div>
        <p style={{
          margin: '14px 0 0', maxWidth: 620, color: tokens.muted,
          fontSize: 15.5, lineHeight: 1.6,
        }}>
          Tamamladığın tüm sınavlar, puanların ve değerlendirme durumları tek bir akışta.
        </p>
      </section>

      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48,
      }}>
        <Stat label="Toplam" value={String(results.length).padStart(2, '0')} accent={tokens.indigo} />
        <Stat label="Değerlendirilen" value={String(graded.length).padStart(2, '0')} sub={`${pending.length} beklemede`} />
        <Stat label="Ortalama" value={avg != null ? String(avg) : '—'} sub={avg != null ? '/ 100' : 'henüz yok'} />
        <Stat label="En iyi" value={best != null ? String(best) : '—'} sub={best != null ? '/ 100 · en yüksek puan' : 'henüz yok'} />
      </section>

      <section>
        <SectionHeader
          kicker="Sonuçlar"
          title="Tüm sınavlar"
          count={visible.length}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              {([
                ['all', 'Hepsi', results.length],
                ['graded', 'Değerlendirilen', graded.length],
                ['submitted', 'Beklemede', pending.length],
              ] as [FilterKey, string, number][]).map(([k, lbl, n]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '8px 12px', borderRadius: 999,
                    background: filter === k ? tokens.ink : '#fff',
                    color: filter === k ? '#fff' : tokens.text,
                    border: `1px solid ${filter === k ? tokens.ink : tokens.hairline}`,
                    fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500,
                    cursor: 'pointer',
                  }}>
                  {lbl}
                  <span style={{
                    fontFamily: tokens.mono, fontSize: 10.5,
                    color: filter === k ? '#9a9aa6' : tokens.subtle,
                    fontWeight: 500,
                  }}>{String(n).padStart(2, '0')}</span>
                </button>
              ))}
            </div>
          }
        />

        {visible.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center' as const,
            background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 12,
            color: tokens.subtle, fontSize: 13.5,
          }}>
            {results.length === 0
              ? 'Henüz tamamlanan sınav yok.'
              : 'Bu kategoride sonuç bulunamadı.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visible.map(r => {
              const isGraded = r.status === 'GRADED';
              const maxScore = r.maxScore ?? 100;
              const pct = isGraded ? Math.round((r.score / maxScore) * 100) : null;
              const perf = pct != null ? scoreLabel(pct) : null;

              return (
                <article key={r.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center', gap: 24,
                  padding: '18px 22px',
                  background: tokens.ivory,
                  border: `1px solid ${tokens.hairline}`,
                  borderRadius: 12,
                }}>
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, color: tokens.subtle }}>
                      {formatTrDateShort(r.submittedAt)}
                    </span>
                    <h4 style={{
                      margin: 0, fontFamily: tokens.serif,
                      fontSize: 18, fontWeight: 400, color: '#2a2a36',
                      letterSpacing: '-0.01em',
                    }}>{r.exam.title}</h4>
                    {r.exam.description && (
                      <p style={{
                        margin: 0, fontSize: 12.5, color: tokens.muted,
                        lineHeight: 1.5, maxWidth: 480,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{r.exam.description}</p>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' as const }}>
                    {isGraded ? (
                      <>
                        <div style={{
                          fontFamily: tokens.serif, fontSize: 32, lineHeight: 1,
                          color: tokens.ink, letterSpacing: '-0.02em',
                        }}>
                          {r.score}
                          <span style={{ fontSize: 16, color: tokens.subtle }}> / {maxScore}</span>
                        </div>
                        {perf && (
                          <div style={{
                            fontFamily: tokens.mono, fontSize: 10.5,
                            color: perf.color, marginTop: 4,
                            fontWeight: 600, letterSpacing: '0.04em',
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                        </svg>
                        Değerlendiriliyor
                      </span>
                    )}
                  </div>

                  <Btn
                    variant="ghost"
                    onClick={() => navigate(`/student/result/${r.id}`)}
                    iconR={<ArrowRight size={13} style={{ opacity: 0.5 }} />}
                  >İncele</Btn>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div style={{ marginTop: 40 }}>
        <Btn
          variant="outline"
          onClick={() => navigate('/student')}
          icon={<ArrowLeft size={14} />}
        >Sınavlarıma Dön</Btn>
      </div>
    </PageShell>
  );
}
