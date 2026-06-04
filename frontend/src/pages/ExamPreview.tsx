import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Check, X, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import { resolveImageUrl } from '../api/images';
import type { Exam, Question } from '../types';
import {
  tokens, PageShell, Crumbs, Kicker, Btn, CodeTag, SectionHeader,
} from '../components/academic-ui';

interface ExamQuestion {
  id: number;
  question: Question;
  orderIndex: number;
}

type Verdict = 'correct' | 'wrong' | 'unanswered' | 'pending';

interface ParsedOption {
  letter: string;
  text: string;
  raw: string;
}

function typeLabel(type: string): string {
  if (type === 'MULTIPLE_CHOICE') return 'Çoktan Seçmeli';
  if (type === 'TRUE_FALSE') return 'Doğru / Yanlış';
  return 'Kısa Cevap';
}

function normalize(s: string): string {
  return (s || '').trim().toLowerCase();
}

function parseOptions(raw: string | undefined): ParsedOption[] {
  if (!raw) return [];
  return raw.split('\n').filter(o => o.trim()).map(line => {
    const letter = line.charAt(0).toUpperCase();
    const cleaned = line.substring(line.indexOf(')') + 1).trim()
      || line.substring(1).trim();
    return { letter, text: cleaned, raw: line };
  });
}

// MULTIPLE_CHOICE için doğru harfi esnek bir şekilde çıkarır.
// correctAnswer şu formlarda olabilir: "B", "B)", "B.", "B) int sayi;", "int sayi;"
function resolveCorrectLetter(q: Question, options: ParsedOption[]): string | null {
  const correct = q.correctAnswer;
  if (!correct) return null;
  const trimmed = correct.trim();
  // 1. Tek karakter → harf
  if (trimmed.length === 1) return trimmed.toUpperCase();
  // 2. "B)" veya "B." gibi → ilk harfi al
  const firstChar = trimmed.charAt(0).toUpperCase();
  if (/^[A-Z][).\-:]/.test(trimmed.toUpperCase())) return firstChar;
  // 3. Tam metin eşleşmesi (options içinden ara)
  const norm = normalize(trimmed);
  const matchByText = options.find(o => normalize(o.text) === norm);
  if (matchByText) return matchByText.letter;
  const matchByRaw = options.find(o => normalize(o.raw) === norm);
  if (matchByRaw) return matchByRaw.letter;
  // 4. correctAnswer içinde herhangi bir option metni geçiyor mu?
  const matchContained = options.find(o => o.text && norm.includes(normalize(o.text)));
  if (matchContained) return matchContained.letter;
  // 5. Son çare: tek harfli prefix
  if (/^[A-Z]/i.test(trimmed)) return firstChar;
  return null;
}

function evaluate(q: Question, answer: string | undefined, options: ParsedOption[]): Verdict {
  if (answer == null || answer === '') return 'unanswered';
  const correct = q.correctAnswer;
  if (!correct) return 'pending';
  if (q.type === 'MULTIPLE_CHOICE') {
    const correctLetter = resolveCorrectLetter(q, options);
    if (!correctLetter) return 'pending';
    return normalize(answer) === normalize(correctLetter) ? 'correct' : 'wrong';
  }
  if (q.type === 'TRUE_FALSE') {
    const a = normalize(answer);
    const c = normalize(correct);
    const truthy = new Set(['true', 'd', 'doğru', '1']);
    const falsy = new Set(['false', 'y', 'yanlış', '0']);
    if (truthy.has(a) && truthy.has(c)) return 'correct';
    if (falsy.has(a) && falsy.has(c)) return 'correct';
    return 'wrong';
  }
  // SHORT_ANSWER
  return normalize(answer) === normalize(correct) ? 'correct' : 'wrong';
}

export default function ExamPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/exams/${id}`),
      api.get(`/exam-questions/exam/${id}/full`),
    ])
      .then(([examRes, qsRes]) => {
        setExam(examRes.data);
        setQuestions(qsRes.data);
      })
      .catch(err => {
        console.error('Error loading exam:', err);
        alert('Sınav yüklenirken hata oluştu!');
      });
  }, [id]);

  if (!exam) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>Yükleniyor…</div>
    );
  }

  const totalPoints = questions.reduce((s, eq) => s + (eq.question.points || 0), 0);
  const answeredCount = questions.filter(eq => !!answers[eq.question.id]).length;
  const correctCount = questions.filter(eq => {
    const opts = parseOptions(eq.question.options);
    return evaluate(eq.question, answers[eq.question.id], opts) === 'correct';
  }).length;
  const wrongCount = questions.filter(eq => {
    const opts = parseOptions(eq.question.options);
    return evaluate(eq.question, answers[eq.question.id], opts) === 'wrong';
  }).length;

  const setAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const resetAnswers = () => {
    setAnswers({});
  };

  return (
    <PageShell>
      <Crumbs items={['Eğitmen', exam.title, 'Önizleme']} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'space-between' }}>
        <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate(`/instructor/exam/${id}`)}>
          Sınav Detayına Dön
        </Btn>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={resetAnswers} icon={<RotateCcw size={14} />}>
            Cevapları Temizle
          </Btn>
          <Btn
            onClick={() => setShowAnswers(v => !v)}
            icon={showAnswers ? <EyeOff size={14} /> : <Eye size={14} />}>
            {showAnswers ? 'Doğru Cevapları Gizle' : 'Doğru Cevapları Göster'}
          </Btn>
        </div>
      </div>

      <div style={{
        marginTop: 20, padding: '14px 18px',
        background: tokens.indigoSoft,
        border: `1px solid ${tokens.indigoBorder}`,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Eye size={18} style={{ color: tokens.indigo, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: tokens.mono, fontSize: 10.5,
            color: tokens.indigo, letterSpacing: '0.1em',
            textTransform: 'uppercase' as const, fontWeight: 600,
          }}>İnteraktif Önizleme</div>
          <div style={{ fontSize: 13, color: '#3730a3', marginTop: 2 }}>
            Soruları çözerken cevabın doğru veya yanlış olduğunu anında görürsün. Cevaplar kaydedilmez.
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 14, fontFamily: tokens.mono, fontSize: 12,
        }}>
          <span style={{ color: tokens.good, fontWeight: 600 }}>✓ {correctCount}</span>
          <span style={{ color: tokens.bad, fontWeight: 600 }}>✗ {wrongCount}</span>
          <span style={{ color: tokens.subtle }}>· {answeredCount}/{questions.length}</span>
        </div>
      </div>

      <section style={{ marginTop: 32, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <CodeTag tone={exam.published ? 'indigo' : 'slate'}>
            {exam.published ? 'YAYINDA' : 'TASLAK'}
          </CodeTag>
        </div>
        <h1 style={{
          margin: 0, fontFamily: tokens.serif,
          fontSize: 44, fontWeight: 400, color: tokens.ink,
          letterSpacing: '-0.025em', lineHeight: 1.05,
        }}>{exam.title}</h1>
        {exam.description && (
          <p style={{
            margin: '14px 0 0', maxWidth: 720, color: tokens.text,
            fontSize: 16, lineHeight: 1.65,
          }}>{exam.description}</p>
        )}

        <div style={{
          marginTop: 24, padding: '20px 0',
          borderTop: `1px solid ${tokens.hairline}`, borderBottom: `1px solid ${tokens.hairline}`,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
        }}>
          <div>
            <Kicker>Süre</Kicker>
            <div style={{
              fontFamily: tokens.serif, fontSize: 24, color: tokens.ink,
              lineHeight: 1.2, marginTop: 6,
            }}>{exam.duration} dakika</div>
          </div>
          <div>
            <Kicker>Soru</Kicker>
            <div style={{
              fontFamily: tokens.serif, fontSize: 24, color: tokens.ink,
              lineHeight: 1.2, marginTop: 6,
            }}>{questions.length} soru</div>
          </div>
          <div>
            <Kicker>Toplam puan</Kicker>
            <div style={{
              fontFamily: tokens.serif, fontSize: 24, color: tokens.ink,
              lineHeight: 1.2, marginTop: 6,
            }}>{totalPoints}</div>
          </div>
        </div>
      </section>

      <SectionHeader kicker="İçerik" title="Sorular" count={questions.length} />

      {questions.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center' as const,
          background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          color: tokens.subtle,
        }}>
          <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted, marginBottom: 8 }}>
            Henüz soru eklenmemiş
          </div>
          <div style={{ fontSize: 13.5 }}>
            Bu sınava "Soru Ekle" ile içerik ekleyebilirsiniz.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {questions.map((eq, idx) => {
            const q = eq.question;
            const answer = answers[q.id];
            const parsedOptions = parseOptions(q.options);
            const verdict = evaluate(q, answer, parsedOptions);
            const correctLetter = q.type === 'MULTIPLE_CHOICE'
              ? resolveCorrectLetter(q, parsedOptions)
              : null;
            return (
              <article key={eq.id} style={{
                padding: 28, background: '#fff',
                border: `1px solid ${tokens.hairline}`, borderRadius: 14,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                  flexWrap: 'wrap' as const,
                }}>
                  <CodeTag>SORU {String(idx + 1).padStart(2, '0')}</CodeTag>
                  <span style={{ fontSize: 12, color: tokens.subtle }}>{typeLabel(q.type)}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cfcfd6' }} />
                  <span style={{ fontSize: 12, color: tokens.subtle }}>{q.points} puan</span>
                  <span style={{ flex: 1 }} />
                  {verdict === 'correct' && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', borderRadius: 6,
                      background: '#ecfdf5', border: '1px solid #bbf7d0',
                      color: tokens.good, fontSize: 12, fontWeight: 600,
                      fontFamily: tokens.mono,
                    }}>
                      <Check size={13} /> Doğru
                    </span>
                  )}
                  {verdict === 'wrong' && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', borderRadius: 6,
                      background: '#fef2f2', border: '1px solid #fecaca',
                      color: tokens.bad, fontSize: 12, fontWeight: 600,
                      fontFamily: tokens.mono,
                    }}>
                      <X size={13} /> Yanlış
                    </span>
                  )}
                </div>

                <h2 style={{
                  margin: 0, fontFamily: tokens.serif,
                  fontSize: 22, fontWeight: 400, lineHeight: 1.4,
                  letterSpacing: '-0.01em', color: tokens.ink,
                }}>{q.questionText}</h2>

                {q.imageUrl && (
                  <img src={resolveImageUrl(q.imageUrl)} alt="Soru görseli"
                    style={{ marginTop: 16, maxWidth: '100%', maxHeight: 320, borderRadius: 10, border: `1px solid ${tokens.hairline}`, objectFit: 'contain', display: 'block' }} />
                )}

                <div style={{ marginTop: 22, display: 'grid', gap: 10 }}>
                  {q.type === 'MULTIPLE_CHOICE' && parsedOptions.map((opt, oIdx) => {
                      const letter = opt.letter;
                      const selected = answer === letter;
                      const isCorrectAnswer = correctLetter != null
                        && normalize(letter) === normalize(correctLetter);
                      const reveal = (selected || showAnswers) && correctLetter != null;
                      let bg = '#fff';
                      let border = tokens.hairline;
                      let badge = tokens.subtle;
                      let badgeBg = '#fff';
                      let badgeBorder = tokens.hairline;
                      if (reveal && isCorrectAnswer) {
                        bg = '#ecfdf5';
                        border = '#bbf7d0';
                        badge = '#fff';
                        badgeBg = tokens.good;
                        badgeBorder = tokens.good;
                      } else if (selected && !isCorrectAnswer) {
                        bg = '#fef2f2';
                        border = '#fecaca';
                        badge = '#fff';
                        badgeBg = tokens.bad;
                        badgeBorder = tokens.bad;
                      } else if (selected) {
                        bg = tokens.indigoSoft;
                        border = '#bfc4ee';
                        badge = '#fff';
                        badgeBg = tokens.indigo;
                        badgeBorder = tokens.indigo;
                      }
                      return (
                        <label key={oIdx} style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          padding: '14px 18px', cursor: 'pointer',
                          background: bg,
                          border: `1px solid ${border}`,
                          borderRadius: 12,
                          transition: 'all 0.12s',
                        }}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={letter}
                            checked={selected}
                            onChange={() => setAnswer(q.id, letter)}
                            style={{ display: 'none' }}
                          />
                          <span style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: badgeBg, color: badge,
                            border: `1px solid ${badgeBorder}`,
                            display: 'grid', placeItems: 'center',
                            fontFamily: tokens.mono, fontSize: 13, fontWeight: 600, flexShrink: 0,
                          }}>{letter}</span>
                          <span style={{ fontSize: 15, color: tokens.ink, flex: 1 }}>
                            {opt.text}
                          </span>
                          {reveal && isCorrectAnswer && (
                            <Check size={16} style={{ color: tokens.good }} />
                          )}
                          {selected && !isCorrectAnswer && (
                            <X size={16} style={{ color: tokens.bad }} />
                          )}
                        </label>
                      );
                    })}

                  {q.type === 'TRUE_FALSE' && [
                    { val: 'true', label: 'Doğru', letter: 'D' },
                    { val: 'false', label: 'Yanlış', letter: 'Y' },
                  ].map(opt => {
                    const selected = answer === opt.val;
                    const isCorrectAnswer = evaluate(q, opt.val, []) === 'correct';
                    const reveal = (selected || showAnswers) && q.correctAnswer;
                    let bg = '#fff';
                    let border = tokens.hairline;
                    let badge = tokens.subtle;
                    let badgeBg = '#fff';
                    let badgeBorder = tokens.hairline;
                    if (reveal && isCorrectAnswer) {
                      bg = '#ecfdf5';
                      border = '#bbf7d0';
                      badge = '#fff';
                      badgeBg = tokens.good;
                      badgeBorder = tokens.good;
                    } else if (selected && !isCorrectAnswer) {
                      bg = '#fef2f2';
                      border = '#fecaca';
                      badge = '#fff';
                      badgeBg = tokens.bad;
                      badgeBorder = tokens.bad;
                    } else if (selected) {
                      bg = tokens.indigoSoft;
                      border = '#bfc4ee';
                      badge = '#fff';
                      badgeBg = tokens.indigo;
                      badgeBorder = tokens.indigo;
                    }
                    return (
                      <label key={opt.val} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '14px 18px', cursor: 'pointer',
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: 12,
                        transition: 'all 0.12s',
                      }}>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.val}
                          checked={selected}
                          onChange={() => setAnswer(q.id, opt.val)}
                          style={{ display: 'none' }}
                        />
                        <span style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: badgeBg, color: badge,
                          border: `1px solid ${badgeBorder}`,
                          display: 'grid', placeItems: 'center',
                          fontFamily: tokens.mono, fontSize: 13, fontWeight: 600,
                        }}>{opt.letter}</span>
                        <span style={{ fontSize: 15, color: tokens.ink, flex: 1 }}>
                          {opt.label}
                        </span>
                        {reveal && isCorrectAnswer && (
                          <Check size={16} style={{ color: tokens.good }} />
                        )}
                        {selected && !isCorrectAnswer && (
                          <X size={16} style={{ color: tokens.bad }} />
                        )}
                      </label>
                    );
                  })}

                  {q.type === 'SHORT_ANSWER' && (
                    <textarea
                      value={answer || ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Cevabını buraya yaz…"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: verdict === 'correct'
                          ? '#ecfdf5'
                          : verdict === 'wrong'
                          ? '#fef2f2'
                          : '#fafafb',
                        border: `1px solid ${
                          verdict === 'correct'
                            ? '#bbf7d0'
                            : verdict === 'wrong'
                            ? '#fecaca'
                            : tokens.hairline
                        }`,
                        borderRadius: 12,
                        fontFamily: tokens.mono, fontSize: 14, color: tokens.ink,
                        resize: 'vertical' as const, boxSizing: 'border-box' as const,
                        outline: 'none',
                      }}
                    />
                  )}
                </div>

                {showAnswers && q.correctAnswer && q.type === 'SHORT_ANSWER' && (
                  <div style={{
                    marginTop: 12, padding: '10px 14px',
                    background: '#ecfdf5', border: '1px solid #bbf7d0',
                    borderRadius: 10, fontSize: 13.5, color: tokens.good,
                    fontFamily: tokens.mono,
                  }}>
                    <strong>Beklenen cevap:</strong> {q.correctAnswer}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
