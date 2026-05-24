import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Send } from 'lucide-react';
import api from '../api/axios';
import type { Question } from '../types';
import {
  tokens, PageShell, Crumbs, HeroTitle, Kicker, SectionHeader, Btn, CodeTag,
  scoreLabel, formatTrDate,
} from '../components/academic-ui';

interface Answer {
  id: number;
  question: Question;
  answerText: string;
  isCorrect: boolean | null;
  pointsEarned: number | null;
}

interface ResultData {
  studentExam: {
    id: number;
    score: number;
    status: string;
    submittedAt: string;
  };
  answers: Answer[];
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
}

export default function ExamResult() {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<ResultData | null>(null);

  const isInstructor = location.pathname.includes('/instructor/');

  useEffect(() => {
    api.get(`/results/student-exam/${studentExamId}`)
      .then(res => setResult(res.data))
      .catch(() => alert('Sonuç yüklenemedi'));
  }, [studentExamId]);

  if (!result) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>Yükleniyor…</div>
    );
  }

  const totalPoints = result.answers.reduce((sum, a) => sum + (a.question.points || 0), 0);
  const percentage = totalPoints > 0 ? (result.studentExam.score / totalPoints) * 100 : 0;
  const correct = result.correctCount;
  const wrong = result.incorrectCount;
  const empty = result.unansweredCount;
  const total = result.totalQuestions;
  const perf = scoreLabel(percentage);

  const correctPct = total > 0 ? (correct / total) * 100 : 0;
  const wrongPct = total > 0 ? (wrong / total) * 100 : 0;

  return (
    <PageShell>
      <Crumbs items={isInstructor ? ['Eğitmen', 'Sınav Sonucu'] : ['Sınavlarım', 'Sonuç']} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        <div>
          <Kicker>Sınav sonucu</Kicker>
          <div style={{ marginTop: 8 }}>
            <HeroTitle>Sınav Tamamlandı</HeroTitle>
          </div>
          <p style={{ margin: '14px 0 0', color: tokens.muted, fontSize: 15.5 }}>
            {formatTrDate(result.studentExam.submittedAt)} — Teslim alındı.
            {result.studentExam.status === 'GRADED'
              ? ' Tüm sorular değerlendirildi.'
              : ' Otomatik puanlanan sorular hemen, kısa cevaplar 48 saat içinde değerlendirilecek.'}
          </p>

          {/* Big score panel */}
          <div style={{
            marginTop: 36, padding: '32px 0',
            borderTop: `1px solid ${tokens.hairline}`, borderBottom: `1px solid ${tokens.hairline}`,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 24, alignItems: 'center',
          }}>
            <div>
              <Kicker>Puanın</Kicker>
              <div style={{
                fontFamily: tokens.serif, fontSize: 72, lineHeight: 0.95,
                color: tokens.ink, letterSpacing: '-0.03em', marginTop: 6,
              }}>
                {result.studentExam.score}
                <span style={{ fontSize: 24, color: tokens.subtle }}> / {totalPoints}</span>
              </div>
              <div style={{
                fontFamily: tokens.mono, fontSize: 11,
                color: perf.color, marginTop: 6, fontWeight: 600, letterSpacing: '0.04em',
              }}>{perf.text} · %{percentage.toFixed(0)} BAŞARI</div>
            </div>

            {/* Donut */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 130, height: 130, borderRadius: '50%',
                background: `conic-gradient(${tokens.indigo} 0% ${correctPct}%, #dc2626 ${correctPct}% ${correctPct + wrongPct}%, #e2e3eb ${correctPct + wrongPct}% 100%)`,
                display: 'grid', placeItems: 'center',
              }}>
                <div style={{
                  width: 96, height: 96, borderRadius: '50%', background: tokens.bg,
                  display: 'grid', placeItems: 'center',
                }}>
                  <div>
                    <div style={{
                      fontFamily: tokens.serif, fontSize: 32, color: tokens.ink, lineHeight: 1,
                    }}>{total}</div>
                    <div style={{
                      fontSize: 10, color: tokens.subtle,
                      textTransform: 'uppercase' as const, letterSpacing: '0.1em',
                    }}>soru</div>
                  </div>
                </div>
              </div>
            </div>

            {[
              ['Doğru', correct, tokens.indigo],
              ['Yanlış', wrong, '#dc2626'],
            ].map(([k, v, c]) => (
              <div key={k as string}>
                <Kicker>{k as string}</Kicker>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                  <span style={{
                    fontFamily: tokens.serif, fontSize: 44, color: c as string,
                    lineHeight: 1, letterSpacing: '-0.02em',
                  }}>{v as number}</span>
                  <span style={{ fontSize: 13, color: tokens.subtle }}>/ {total}</span>
                </div>
                <div style={{
                  marginTop: 8, height: 4, background: tokens.hairlineSoft,
                  borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    width: total > 0 ? `${((v as number) / total) * 100}%` : '0%',
                    height: '100%', background: c as string,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {empty > 0 && (
            <div style={{
              marginTop: 16, padding: '12px 16px',
              background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10,
              color: '#9a3412', fontSize: 13,
            }}>
              <strong>{empty}</strong> soru boş bırakıldı.
            </div>
          )}

          {/* Answers list */}
          <section style={{ marginTop: 40 }}>
            <SectionHeader
              kicker="Cevap Anahtarı"
              title="Soru bazında"
              count={total}
              action={<Btn icon={<Download size={13} />}>PDF olarak indir</Btn>}
            />
            <div style={{ display: 'grid', gap: 10 }}>
              {result.answers.map((a, i) => {
                const tone = a.isCorrect === true
                  ? { fg: tokens.good, bg: '#ecfdf5', br: '#bbf7d0', lbl: '✓ Doğru' }
                  : a.isCorrect === false
                  ? { fg: tokens.bad, bg: '#fef2f2', br: '#fecaca', lbl: '✗ Yanlış' }
                  : { fg: '#9a3412', bg: '#fff7ed', br: '#fed7aa', lbl: '⋯ Değerlendiriliyor' };

                return (
                  <article key={a.id} style={{
                    padding: 18, background: '#fff',
                    border: `1px solid ${tokens.hairline}`, borderRadius: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: 5,
                        background: tokens.ink, color: '#fff',
                        display: 'grid', placeItems: 'center',
                        fontFamily: tokens.mono, fontSize: 11, fontWeight: 600,
                      }}>{String(i + 1).padStart(2, '0')}</span>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4,
                        background: tone.bg, color: tone.fg, border: `1px solid ${tone.br}`,
                        fontSize: 11, fontWeight: 600,
                      }}>{tone.lbl}</span>
                      <span style={{ flex: 1 }} />
                      <span style={{
                        fontFamily: tokens.mono, fontSize: 12,
                        color: tokens.ink, fontWeight: 500,
                      }}>{a.pointsEarned ?? '—'} / {a.question.points}</span>
                    </div>
                    <p style={{
                      margin: 0, fontSize: 15, color: tokens.ink, lineHeight: 1.5,
                      fontFamily: tokens.serif, fontWeight: 400,
                    }}>{a.question.questionText}</p>
                    <div style={{
                      marginTop: 10, padding: '8px 12px',
                      background: '#fafafb', border: `1px solid ${tokens.hairlineSoft}`,
                      borderRadius: 6, fontSize: 12.5, color: tokens.text,
                      fontFamily: tokens.mono,
                    }}>
                      <span style={{ color: tokens.subtle }}>Cevabın: </span>
                      {a.answerText || 'Boş'}
                    </div>
                    {a.isCorrect === false && a.question.correctAnswer && (
                      <div style={{
                        marginTop: 6, padding: '8px 12px',
                        background: '#ecfdf5', border: '1px solid #bbf7d0',
                        borderRadius: 6, fontSize: 12.5, color: tokens.good,
                        fontFamily: tokens.mono,
                      }}>
                        <span style={{ color: '#16a34a' }}>Doğru cevap: </span>
                        {a.question.correctAnswer}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 24 }}>
          <div style={{
            padding: 24, background: '#fff',
            border: `1px solid ${tokens.hairline}`, borderRadius: 14, marginBottom: 12,
          }}>
            <Kicker>Özet</Kicker>

            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {[
                ['Doğru', correct, tokens.good],
                ['Yanlış', wrong, tokens.bad],
                ['Boş', empty, tokens.muted],
                ['Toplam puan', `${result.studentExam.score} / ${totalPoints}`, tokens.ink],
              ].map(([k, v, c]) => (
                <div key={k as string} style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: 13,
                  paddingBottom: 8, borderBottom: `1px solid ${tokens.hairlineSoft}`,
                }}>
                  <span style={{ color: tokens.subtle }}>{k}</span>
                  <span style={{
                    color: c as string, fontWeight: 600, fontFamily: tokens.mono,
                  }}>{v as string | number}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <Kicker>Durum</Kicker>
              <div style={{ marginTop: 8 }}>
                <CodeTag tone={result.studentExam.status === 'GRADED' ? 'indigo' : 'slate'}>
                  {result.studentExam.status === 'GRADED' ? 'DEĞERLENDİRİLDİ' : 'TESLİM EDİLDİ'}
                </CodeTag>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <Btn
              variant="outline"
              onClick={() => isInstructor ? navigate(-1) : navigate('/student?refresh=' + Date.now())}
              icon={<ArrowLeft size={14} />}
              style={{ width: '100%', justifyContent: 'center' }}
            >{isInstructor ? 'Geri Dön' : 'Sınavlarıma Dön'}</Btn>
            {!isInstructor && (
              <Btn variant="ghost" icon={<Send size={14} />}
                style={{ width: '100%', justifyContent: 'center' }}>
                Eğitmene Soru Sor
              </Btn>
            )}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
