import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useExamStatistics } from '../hooks/useExamStatistics';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, Stat, SectionHeader, Btn,
} from '../components/academic-ui';

function successTone(rate: number) {
  if (rate >= 70) return { bg: '#ecfdf5', fg: tokens.good, br: '#bbf7d0', bar: tokens.good };
  if (rate >= 40) return { bg: tokens.indigoSoft, fg: tokens.indigo, br: tokens.indigoBorder, bar: tokens.indigo };
  return { bg: '#fef2f2', fg: tokens.bad, br: '#fecaca', bar: tokens.bad };
}

function discriminationColor(value?: number): string {
  if (value == null) return tokens.subtle;
  if (value >= 0.4) return tokens.good;     // çok iyi ayırıcı
  if (value >= 0.2) return tokens.indigo;   // kabul edilebilir
  if (value >= 0) return '#b45309';         // zayıf
  return tokens.bad;                         // negatif = sorunlu
}

function DistractorPanel({
  distribution, correctAnswer,
}: { distribution: Record<string, number>; correctAnswer?: string }) {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  if (total === 0) return null;

  return (
    <div style={{
      marginTop: 14, paddingTop: 12,
      borderTop: `1px solid ${tokens.hairlineSoft}`,
    }}>
      <Kicker>Seçenek dağılımı</Kicker>
      <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
        {entries.map(([opt, count]) => {
          const pct = (count / total) * 100;
          const isCorrect = correctAnswer != null
            && opt.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
          const color = isCorrect ? tokens.good : tokens.subtle;
          return (
            <div key={opt} style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 60px',
              gap: 12, alignItems: 'center', fontSize: 12.5,
            }}>
              <span style={{
                fontFamily: tokens.mono, fontWeight: 600,
                color: isCorrect ? tokens.good : tokens.text,
              }}>
                {isCorrect && '✓ '}{opt || '—'}
              </span>
              <div style={{
                height: 6, background: tokens.hairlineSoft,
                borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: isCorrect ? tokens.good : '#cfcfd6',
                }} />
              </div>
              <span style={{
                fontFamily: tokens.mono, color,
                textAlign: 'right' as const, fontWeight: 500,
              }}>{count} · %{pct.toFixed(0)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ExamStatistics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stats, examTitle, sortedQuestions } = useExamStatistics(id);

  if (!stats) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>İstatistikler yükleniyor…</div>
    );
  }

  return (
    <PageShell>
      <Crumbs items={['Eğitmen', examTitle || 'Sınav', 'İstatistikler']} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 24, marginBottom: 32, flexWrap: 'wrap' as const,
      }}>
        <div>
          <Kicker>Performans analizi</Kicker>
          <div style={{ marginTop: 8 }}>
            <HeroTitle>Sınav İstatistikleri</HeroTitle>
          </div>
          <p style={{
            margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
            fontSize: 15.5, lineHeight: 1.6,
          }}>
            {examTitle && <strong style={{ color: tokens.ink, fontWeight: 600 }}>{examTitle}</strong>}
            {' — '}öğrenci performansları, başarı oranları ve soru bazlı analizler.
          </p>
        </div>

        <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate(`/instructor/exam/${id}`)}>
          Sınava Dön
        </Btn>
      </div>

      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48,
      }}>
        <Stat label="Katılımcı" value={String(stats.totalParticipants).padStart(2, '0')} accent={tokens.indigo} />
        <Stat label="Tamamlayan" value={String(stats.completedCount).padStart(2, '0')} sub="öğrenci" />
        <Stat label="Ortalama" value={stats.averageScore.toFixed(0)} sub="puan" />
        <Stat label="Aralık" value={`${stats.minScore.toFixed(0)}—${stats.maxScore.toFixed(0)}`} sub="min — max" />
      </section>

      <SectionHeader
        kicker="Madde analizi"
        title="Soru bazlı başarı"
        count={sortedQuestions.length}
        sub="En zor sorulardan başlayarak sıralandı."
      />

      {sortedQuestions.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center' as const,
          background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
        }}>
          <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted }}>
            Henüz analiz verisi yok
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {sortedQuestions.map((qStat, idx) => {
            const tone = successTone(qStat.successRate);
            return (
              <article key={qStat.question.id} style={{
                padding: 20, background: '#fff',
                border: `1px solid ${tokens.hairline}`, borderRadius: 12,
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: 16, marginBottom: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                    }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: 5,
                        background: tokens.ink, color: '#fff',
                        display: 'grid', placeItems: 'center',
                        fontFamily: tokens.mono, fontSize: 11, fontWeight: 600,
                      }}>{String(idx + 1).padStart(2, '0')}</span>
                      <span style={{ fontSize: 12, color: tokens.subtle }}>
                        {qStat.question.points} puan
                      </span>
                    </div>
                    <p style={{
                      margin: 0, fontFamily: tokens.serif,
                      fontSize: 16, lineHeight: 1.45, color: tokens.ink, fontWeight: 400,
                    }}>{qStat.question.questionText}</p>
                  </div>

                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 4,
                    background: tone.bg, color: tone.fg, border: `1px solid ${tone.br}`,
                    fontSize: 12, fontWeight: 600, flexShrink: 0,
                    fontFamily: tokens.mono,
                  }}>%{qStat.successRate.toFixed(0)} BAŞARI</span>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 20, alignItems: 'center', marginTop: 14,
                  paddingTop: 14, borderTop: `1px solid ${tokens.hairlineSoft}`,
                }}>
                  <div>
                    <Kicker>Toplam</Kicker>
                    <div style={{
                      fontFamily: tokens.mono, fontSize: 16, marginTop: 4,
                      color: tokens.ink, fontWeight: 600,
                    }}>{qStat.totalAnswers}</div>
                  </div>
                  <div>
                    <Kicker>Doğru</Kicker>
                    <div style={{
                      fontFamily: tokens.mono, fontSize: 16, marginTop: 4,
                      color: tokens.good, fontWeight: 600,
                    }}>{qStat.correctAnswers}</div>
                  </div>
                  <div>
                    <Kicker>Yanlış</Kicker>
                    <div style={{
                      fontFamily: tokens.mono, fontSize: 16, marginTop: 4,
                      color: tokens.bad, fontWeight: 600,
                    }}>{qStat.incorrectAnswers}</div>
                  </div>
                  <div>
                    <Kicker>Zorluk</Kicker>
                    <div style={{
                      fontFamily: tokens.mono, fontSize: 16, marginTop: 4,
                      color: tokens.ink, fontWeight: 600,
                    }} title="0 = en zor · 1 = en kolay">
                      {qStat.difficultyIndex != null
                        ? qStat.difficultyIndex.toFixed(2)
                        : '—'}
                    </div>
                  </div>
                  <div>
                    <Kicker>Ayırıcı</Kicker>
                    <div style={{
                      fontFamily: tokens.mono, fontSize: 16, marginTop: 4,
                      color: discriminationColor(qStat.discriminationIndex), fontWeight: 600,
                    }} title="Üst %27 ile alt %27 arası başarı farkı">
                      {qStat.discriminationIndex != null
                        ? qStat.discriminationIndex.toFixed(2)
                        : '—'}
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: 12, height: 6, background: tokens.hairlineSoft,
                  borderRadius: 3, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${qStat.successRate}%`, height: '100%', background: tone.bar,
                  }} />
                </div>

                {qStat.optionDistribution && Object.keys(qStat.optionDistribution).length > 0 && (
                  <DistractorPanel
                    distribution={qStat.optionDistribution}
                    correctAnswer={qStat.question.correctAnswer}
                  />
                )}
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
