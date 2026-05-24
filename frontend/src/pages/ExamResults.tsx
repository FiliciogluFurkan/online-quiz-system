import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Edit3 } from 'lucide-react';
import api from '../api/axios';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, Stat, SectionHeader, Btn, CodeTag,
  formatTrDate, scoreLabel,
} from '../components/academic-ui';

interface StudentExam {
  id: number;
  status: string;
  score: number | null;
  startedAt: string;
  submittedAt: string | null;
}

function statusMeta(status: string) {
  switch (status) {
    case 'GRADED': return { label: 'Değerlendirildi', bg: '#ecfdf5', fg: tokens.good, br: '#bbf7d0' };
    case 'SUBMITTED': return { label: 'Teslim Edildi', bg: tokens.indigoSoft, fg: tokens.indigo, br: tokens.indigoBorder };
    case 'IN_PROGRESS': return { label: 'Devam Ediyor', bg: '#fff7ed', fg: '#9a3412', br: '#fed7aa' };
    default: return { label: 'Başlanmadı', bg: '#f1f3f6', fg: tokens.muted, br: tokens.hairline };
  }
}

export default function ExamResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<StudentExam[]>([]);
  const [examTitle, setExamTitle] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/exams/${id}`),
      api.get(`/results/exam/${id}`),
    ])
      .then(([examRes, resultsRes]) => {
        setExamTitle(examRes.data.title);
        setResults(resultsRes.data);
      })
      .catch(console.error);
  }, [id]);

  const completed = results.filter(r => r.status === 'GRADED' || r.status === 'SUBMITTED');
  const inProgress = results.filter(r => r.status === 'IN_PROGRESS');
  const graded = results.filter(r => r.status === 'GRADED' && r.score != null);

  const avgScore = useMemo(() => {
    if (graded.length === 0) return null;
    return Math.round(graded.reduce((s, r) => s + (r.score || 0), 0) / graded.length);
  }, [graded]);

  return (
    <PageShell>
      <Crumbs items={['Eğitmen', examTitle || 'Sınav', 'Sonuçlar']} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 24, marginBottom: 32, flexWrap: 'wrap' as const,
      }}>
        <div>
          <Kicker>Performans raporu</Kicker>
          <div style={{ marginTop: 8 }}>
            <HeroTitle>Sınav Sonuçları</HeroTitle>
          </div>
          <p style={{
            margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
            fontSize: 15.5, lineHeight: 1.6,
          }}>
            {examTitle ? <strong style={{ color: tokens.ink, fontWeight: 600 }}>{examTitle}</strong> : 'Sınav bilgisi yükleniyor…'}
            {examTitle && ' — öğrenci katılımı ve puan dağılımı.'}
          </p>
        </div>

        <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate(`/instructor/exam/${id}`)}>
          Sınava Dön
        </Btn>
      </div>

      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48,
      }}>
        <Stat label="Katılımcı" value={String(results.length).padStart(2, '0')} accent={tokens.indigo} />
        <Stat label="Tamamlanan" value={String(completed.length).padStart(2, '0')} sub={`${inProgress.length} devam ediyor`} />
        <Stat label="Ortalama" value={avgScore != null ? String(avgScore) : '—'} sub={graded.length > 0 ? `${graded.length} değerlendirildi` : 'henüz puan yok'} />
        <Stat label="En Yüksek" value={graded.length > 0 ? String(Math.max(...graded.map(r => r.score!))) : '—'} sub={graded.length > 0 ? '/ 100' : 'henüz puan yok'} />
      </section>

      <section>
        <SectionHeader kicker="Liste" title="Öğrenci sonuçları" count={results.length} />

        {results.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center' as const,
            background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          }}>
            <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted, marginBottom: 8 }}>
              Henüz sonuç yok
            </div>
            <div style={{ fontSize: 13.5, color: tokens.subtle, maxWidth: 440, margin: '0 auto' }}>
              Bu sınava henüz hiçbir öğrenci katılmadı. Katılımlar başladığında
              sonuçlar burada görünecek.
            </div>
          </div>
        ) : (
          <div style={{
            background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 12,
            overflow: 'hidden',
          }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse' as const, fontSize: 13,
            }}>
              <thead style={{
                background: tokens.ivory,
                borderBottom: `1px solid ${tokens.hairline}`,
              }}>
                <tr>
                  {['Öğrenci', 'Durum', 'Puan', 'Başlangıç', 'Teslim', 'İşlem'].map(h => (
                    <th key={h} style={{
                      padding: '12px 18px', textAlign: 'left' as const,
                      fontFamily: tokens.mono, fontSize: 10.5,
                      color: tokens.subtle, letterSpacing: '0.08em',
                      textTransform: 'uppercase' as const, fontWeight: 600,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => {
                  const sm = statusMeta(r.status);
                  const canView = r.status === 'GRADED' || r.status === 'SUBMITTED';
                  const pct = r.score != null ? scoreLabel(r.score) : null;

                  return (
                    <tr key={r.id} style={{
                      borderTop: idx === 0 ? 'none' : `1px solid ${tokens.hairlineSoft}`,
                    }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: tokens.indigoSoft, color: tokens.indigo,
                            display: 'grid', placeItems: 'center',
                            fontFamily: tokens.mono, fontSize: 11, fontWeight: 600,
                          }}>{String(idx + 1).padStart(2, '0')}</div>
                          <span style={{ color: tokens.ink, fontWeight: 500 }}>
                            Öğrenci #{r.id}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 9px', borderRadius: 4,
                          background: sm.bg, color: sm.fg, border: `1px solid ${sm.br}`,
                          fontSize: 11, fontWeight: 600,
                        }}>{sm.label}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {r.score != null ? (
                          <span style={{
                            fontFamily: tokens.mono, fontSize: 14,
                            color: pct?.color ?? tokens.ink, fontWeight: 600,
                          }}>{r.score}</span>
                        ) : (
                          <span style={{ color: tokens.subtle }}>—</span>
                        )}
                      </td>
                      <td style={{
                        padding: '14px 18px', fontFamily: tokens.mono,
                        fontSize: 12, color: tokens.muted,
                      }}>{formatTrDate(r.startedAt)}</td>
                      <td style={{
                        padding: '14px 18px', fontFamily: tokens.mono,
                        fontSize: 12, color: tokens.muted,
                      }}>{formatTrDate(r.submittedAt)}</td>
                      <td style={{ padding: '14px 18px' }}>
                        {canView ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn onClick={() => navigate(`/instructor/result/${r.id}`)}
                              icon={<Eye size={12} />}
                              style={{ padding: '6px 10px', fontSize: 12 }}>
                              Detay
                            </Btn>
                            <Btn variant="outline"
                              onClick={() => navigate(`/instructor/grade/${r.id}`)}
                              icon={<Edit3 size={12} />}
                              style={{ padding: '6px 10px', fontSize: 12 }}>
                              Puanla
                            </Btn>
                          </div>
                        ) : (
                          <span style={{ color: tokens.subtle }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
