import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Sigma, Award, CheckCircle2, BarChart3 } from 'lucide-react';
import { useExamStatistics } from '../hooks/useExamStatistics';
import { tokens } from '../components/academic-ui';

function difficultyMeta(rate: number): { label: string; color: string } {
  if (rate < 40) return { label: 'Zor', color: tokens.bad };
  if (rate < 70) return { label: 'Orta', color: tokens.indigo };
  return { label: 'Kolay', color: '#0369a1' };
}

function discriminationMeta(value?: number): { label: string; color: string } {
  if (value == null) return { label: '—', color: tokens.subtle };
  if (value >= 0.5) return { label: 'Mükemmel', color: tokens.good };
  if (value >= 0.3) return { label: 'İyi', color: tokens.indigo };
  if (value >= 0.2) return { label: 'Zayıf', color: tokens.warn };
  return { label: 'Sorunlu', color: tokens.bad };
}

function StatCard({ label, value, denom, icon, iconBg, iconColor, accent }: {
  label: string; value: string; denom?: string; icon: React.ReactNode; iconBg: string; iconColor: string; accent?: string;
}) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 22, boxShadow: '0 4px 24px -4px rgba(30,58,138,0.06)' }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: tokens.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: accent ?? tokens.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</span>
            {denom && <span style={{ fontSize: 16, color: tokens.muted, fontWeight: 600 }}>{denom}</span>}
          </div>
        </div>
        <span style={{ width: 38, height: 38, borderRadius: 9, background: iconBg, color: iconColor, display: 'grid', placeItems: 'center' }}>{icon}</span>
      </div>
    </div>
  );
}

export default function ExamStatistics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stats, examTitle, sortedQuestions } = useExamStatistics(id);

  if (!stats) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: tokens.bg, color: tokens.muted }}>İstatistikler yükleniyor…</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 40px 64px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => navigate(`/instructor/exam/${id}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: tokens.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 10, fontFamily: 'inherit' }}>
            <ArrowLeft size={16} />Sınav Detayına Dön
          </button>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>{examTitle || 'Sınav'} — İstatistikler</h1>
          <p style={{ margin: '6px 0 0', color: tokens.muted, fontSize: 15 }}>Öğrenci performansları, başarı oranları ve soru bazlı analizler.</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
          <StatCard label="Katılım" value={String(stats.completedCount)} denom={`/${stats.totalParticipants}`} icon={<Users size={18} />} iconBg="#e5eeff" iconColor={tokens.navy} />
          <StatCard label="Ortalama" value={stats.averageScore.toFixed(0)} icon={<Sigma size={18} />} iconBg="#e2dfff" iconColor={tokens.indigo} />
          <StatCard label="En Yüksek" value={stats.maxScore.toFixed(0)} icon={<Award size={18} />} iconBg="#dce1ff" iconColor={tokens.navy} accent={tokens.navy} />
          <StatCard label="Geçme Oranı" value="—" icon={<CheckCircle2 size={18} />} iconBg="#c9e6ff" iconColor="#004c6e" />
        </div>

        {/* Main analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
          {/* Puan Dağılımı */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 24, boxShadow: '0 4px 24px -4px rgba(30,58,138,0.06)' }}>
            <h3 style={{ margin: '0 0 22px', fontSize: 18, fontWeight: 700 }}>Puan Dağılımı</h3>
            <div style={{ height: 200, display: 'grid', placeItems: 'center', textAlign: 'center', color: tokens.subtle }}>
              <div>
                <BarChart3 size={32} style={{ color: tokens.hairline }} />
                <div style={{ fontSize: 13, marginTop: 10 }}>Puan dağılımı verisi yakında.</div>
                <div style={{ fontSize: 11.5, marginTop: 4, color: tokens.subtle }}>(Histogram backend'e eklenince dolacak)</div>
              </div>
            </div>
          </div>

          {/* Soru Analizi */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 24px -4px rgba(30,58,138,0.06)' }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${tokens.hairline}` }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Soru Analizi</h3>
            </div>
            {sortedQuestions.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: tokens.subtle }}>Henüz analiz verisi yok.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: tokens.ivory, borderBottom: `1px solid ${tokens.hairline}` }}>
                      {['Soru', 'Zorluk (%)', 'Ayırt Edicilik', 'Doğru / Yanlış'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: tokens.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedQuestions.map((qStat, idx) => {
                      const rate = qStat.successRate;
                      const diff = difficultyMeta(rate);
                      const disc = discriminationMeta(qStat.discriminationIndex);
                      const correctPct = qStat.totalAnswers > 0 ? Math.round((qStat.correctAnswers / qStat.totalAnswers) * 100) : 0;
                      return (
                        <tr key={qStat.question.id} style={{ borderBottom: `1px solid ${tokens.hairlineSoft}` }}>
                          <td style={{ padding: '14px 20px', fontSize: 13.5, fontWeight: 600, color: tokens.ink, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ color: tokens.subtle, marginRight: 6 }}>{idx + 1}.</span>{qStat.question.questionText}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 34, fontSize: 13, fontWeight: 600 }}>{rate.toFixed(0)}%</span>
                              <span style={{ width: 60, height: 7, borderRadius: 99, background: '#d3e4fe', overflow: 'hidden' }}>
                                <span style={{ display: 'block', width: `${rate}%`, height: '100%', background: diff.color }} />
                              </span>
                              <span style={{ fontSize: 11.5, color: tokens.subtle }}>({diff.label})</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: 13.5 }}>
                            {qStat.discriminationIndex != null ? qStat.discriminationIndex.toFixed(2) : '—'}
                            <span style={{ color: disc.color, fontSize: 11.5, marginLeft: 6 }}>({disc.label})</span>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ display: 'flex', width: 120, height: 12, borderRadius: 4, overflow: 'hidden' }} title={`Doğru %${correctPct}`}>
                              <span style={{ width: `${correctPct}%`, background: tokens.navy }} />
                              <span style={{ width: `${100 - correctPct}%`, background: '#d3e4fe' }} />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
