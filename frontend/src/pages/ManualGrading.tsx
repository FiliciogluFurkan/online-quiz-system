import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check } from 'lucide-react';
import { useManualGrading } from '../hooks/useManualGrading';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, SectionHeader, Btn, CodeTag,
} from '../components/academic-ui';

export default function ManualGrading() {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const {
    result, grades, feedbacks, savedAnswers,
    handleGradeChange, handleFeedbackChange, handleSaveGrade,
    manualAnswers, totalPossiblePoints,
  } = useManualGrading(studentExamId);

  if (!result) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>Manuel puanlama yükleniyor…</div>
    );
  }

  return (
    <PageShell>
      <Crumbs items={['Eğitmen', 'Sınav', 'Manuel puanlama']} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 24, marginBottom: 32, flexWrap: 'wrap' as const,
      }}>
        <div>
          <Kicker>Manuel değerlendirme</Kicker>
          <div style={{ marginTop: 8 }}>
            <HeroTitle>Kısa Cevap Puanlama</HeroTitle>
          </div>
          <p style={{
            margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
            fontSize: 15.5, lineHeight: 1.6,
          }}>
            Öğrencinin kısa cevaplarını incele ve her birine 0 ile maksimum puan
            arasında değerlendirme ver.
          </p>
        </div>

        <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>Geri Dön</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
        <div>
          <SectionHeader
            kicker="Cevaplar"
            title="Değerlendirilecek"
            count={manualAnswers.length}
          />

          {manualAnswers.length === 0 ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center' as const,
              background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
            }}>
              <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted, marginBottom: 8 }}>
                Manuel puanlama gerekmiyor
              </div>
              <div style={{ fontSize: 13.5, color: tokens.subtle, maxWidth: 460, margin: '0 auto' }}>
                Tüm sorular otomatik değerlendirildi veya kısa cevap sorusu bulunmuyor.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {manualAnswers.map((answer, idx) => {
                const isSaved = savedAnswers.has(answer.id);
                return (
                  <article key={answer.id} style={{
                    padding: 22, background: '#fff',
                    border: `1px solid ${tokens.hairline}`, borderRadius: 12,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                    }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: tokens.ink, color: '#fff',
                        display: 'grid', placeItems: 'center',
                        fontFamily: tokens.mono, fontSize: 12, fontWeight: 600,
                      }}>{String(idx + 1).padStart(2, '0')}</span>
                      <CodeTag tone="slate">Kısa Cevap</CodeTag>
                      <span style={{ fontSize: 12, color: tokens.subtle }}>
                        max {answer.question.points} puan
                      </span>
                    </div>

                    <p style={{
                      margin: 0, fontFamily: tokens.serif,
                      fontSize: 17, lineHeight: 1.45, color: tokens.ink, fontWeight: 400,
                    }}>{answer.question.questionText}</p>

                    <div style={{ marginTop: 14 }}>
                      <Kicker>Öğrencinin Cevabı</Kicker>
                      <div style={{
                        marginTop: 8, padding: '12px 14px',
                        background: tokens.ivory, border: `1px solid ${tokens.hairline}`,
                        borderRadius: 8, fontFamily: tokens.mono,
                        fontSize: 13.5, color: tokens.ink, lineHeight: 1.6,
                        whiteSpace: 'pre-wrap' as const,
                      }}>{answer.answerText || '(Boş bırakılmış)'}</div>
                    </div>

                    {answer.question.correctAnswer && (
                      <div style={{ marginTop: 12 }}>
                        <Kicker>Örnek / Beklenen</Kicker>
                        <div style={{
                          marginTop: 8, padding: '12px 14px',
                          background: '#ecfdf5', border: '1px solid #bbf7d0',
                          borderRadius: 8, fontFamily: tokens.mono,
                          fontSize: 13.5, color: tokens.good, lineHeight: 1.6,
                          whiteSpace: 'pre-wrap' as const,
                        }}>{answer.question.correctAnswer}</div>
                      </div>
                    )}

                    <div style={{
                      marginTop: 18, paddingTop: 16,
                      borderTop: `1px solid ${tokens.hairlineSoft}`,
                    }}>
                      <Kicker>Öğrenciye Geri Bildirim</Kicker>
                      <textarea
                        value={feedbacks[answer.id] ?? ''}
                        onChange={e => handleFeedbackChange(answer.id, e.target.value)}
                        placeholder="Cevap hakkında not yazabilirsin — öğrenci sonuç sayfasında görür (opsiyonel)…"
                        rows={2}
                        style={{
                          marginTop: 8, width: '100%',
                          padding: '10px 12px',
                          background: '#fafafb',
                          border: `1px solid ${tokens.hairline}`,
                          borderRadius: 8, fontFamily: 'inherit',
                          fontSize: 13.5, color: tokens.ink, lineHeight: 1.55,
                          resize: 'vertical' as const, outline: 'none',
                          boxSizing: 'border-box' as const,
                        }}
                      />
                    </div>

                    <div style={{
                      marginTop: 14, paddingTop: 14,
                      borderTop: `1px solid ${tokens.hairlineSoft}`,
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{ flex: 1 }}>
                        <Kicker>Puan</Kicker>
                        <div style={{ fontSize: 12, color: tokens.subtle, marginTop: 4 }}>
                          0 — {answer.question.points} arası
                        </div>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={answer.question.points}
                        step={1}
                        value={grades[answer.id] ?? ''}
                        onChange={e => handleGradeChange(answer.id, e.target.value)}
                        placeholder="0"
                        style={{
                          width: 90, padding: '10px 12px',
                          background: '#fff', border: `1px solid ${tokens.hairline}`,
                          borderRadius: 8, fontFamily: tokens.mono,
                          fontSize: 16, fontWeight: 600,
                          color: tokens.ink, textAlign: 'center' as const,
                          outline: 'none',
                        }}
                      />
                      {isSaved ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', borderRadius: 8,
                          background: '#ecfdf5', color: tokens.good,
                          border: '1px solid #bbf7d0',
                          fontSize: 13, fontWeight: 600,
                        }}>
                          <Check size={14} /> Kaydedildi
                        </span>
                      ) : (
                        <Btn variant="primary"
                          onClick={() => handleSaveGrade(answer.id, answer.question.points)}
                          icon={<Save size={14} />}>Kaydet</Btn>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside style={{ position: 'sticky', top: 24 }}>
          <div style={{
            padding: 24, background: '#fff',
            border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          }}>
            <Kicker>Değerlendirme özeti</Kicker>

            <div style={{ marginTop: 18 }}>
              <div style={{
                fontFamily: tokens.serif, fontSize: 48, lineHeight: 1,
                color: tokens.ink, letterSpacing: '-0.025em',
              }}>
                {result.studentExam.score}
                <span style={{ fontSize: 20, color: tokens.subtle }}> / {totalPossiblePoints}</span>
              </div>
              <div style={{ fontSize: 12, color: tokens.subtle, marginTop: 6 }}>
                anlık toplam puan
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: `1px solid ${tokens.hairline}`, margin: '20px 0' }} />

            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Toplam soru', result.answers.length],
                ['Manuel', manualAnswers.length],
                ['Kaydedilen', savedAnswers.size],
              ].map(([k, v]) => (
                <div key={k as string} style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: 13,
                  paddingBottom: 8, borderBottom: `1px solid ${tokens.hairlineSoft}`,
                }}>
                  <span style={{ color: tokens.subtle }}>{k}</span>
                  <span style={{
                    color: tokens.ink, fontWeight: 600, fontFamily: tokens.mono,
                  }}>{v as number}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 18, padding: 12,
              background: tokens.indigoSoft,
              border: `1px solid ${tokens.indigoBorder}`,
              borderRadius: 10, fontSize: 12.5, color: '#3730a3', lineHeight: 1.55,
            }}>
              Her puanlamayı kaydettikçe öğrencinin toplam skoru otomatik olarak güncellenir.
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
