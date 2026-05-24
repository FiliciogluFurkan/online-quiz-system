import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import api from '../api/axios';
import type { Exam, Question } from '../types';
import {
  tokens, PageShell, Crumbs, Kicker, Btn, CodeTag, SectionHeader,
} from '../components/academic-ui';

interface ExamQuestion {
  id: number;
  question: Question;
  orderIndex: number;
}

function typeLabel(type: string): string {
  if (type === 'MULTIPLE_CHOICE') return 'Çoktan Seçmeli';
  if (type === 'TRUE_FALSE') return 'Doğru / Yanlış';
  return 'Kısa Cevap';
}

export default function ExamPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  useEffect(() => {
    Promise.all([
      api.get(`/exams/${id}`),
      api.get(`/exam-questions/exam/${id}`),
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

  return (
    <PageShell>
      <Crumbs items={['Eğitmen', exam.title, 'Önizleme']} />

      <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate(`/instructor/exam/${id}`)}>
        Sınav Detayına Dön
      </Btn>

      <div style={{
        marginTop: 20, padding: '14px 18px',
        background: tokens.indigoSoft,
        border: `1px solid ${tokens.indigoBorder}`,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Eye size={18} style={{ color: tokens.indigo, flexShrink: 0 }} />
        <div>
          <div style={{
            fontFamily: tokens.mono, fontSize: 10.5,
            color: tokens.indigo, letterSpacing: '0.1em',
            textTransform: 'uppercase' as const, fontWeight: 600,
          }}>Önizleme Modu</div>
          <div style={{ fontSize: 13, color: '#3730a3', marginTop: 2 }}>
            Bu sınavı öğrenci gözüyle görüyorsunuz. Cevaplar kaydedilmeyecek.
          </div>
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
        <div style={{ display: 'grid', gap: 10 }}>
          {questions.map((eq, idx) => (
            <article key={eq.id} style={{
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
                <CodeTag tone="slate">{typeLabel(eq.question.type)}</CodeTag>
                <span style={{ fontSize: 12, color: tokens.subtle }}>{eq.question.points} puan</span>
              </div>

              <p style={{
                margin: 0, fontFamily: tokens.serif,
                fontSize: 18, lineHeight: 1.45, color: tokens.ink, fontWeight: 400,
              }}>{eq.question.questionText}</p>

              {eq.question.options && (
                <pre style={{
                  margin: '14px 0 0', padding: '12px 14px',
                  background: '#fafafb', border: `1px solid ${tokens.hairlineSoft}`,
                  borderRadius: 8, fontFamily: tokens.mono,
                  fontSize: 13, color: tokens.text,
                  whiteSpace: 'pre-wrap' as const, lineHeight: 1.7,
                }}>{eq.question.options}</pre>
              )}

              {eq.question.correctAnswer && (
                <div style={{
                  marginTop: 12, padding: '10px 14px',
                  background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: tokens.good,
                  fontFamily: tokens.mono,
                }}>
                  <span style={{ fontWeight: 600 }}>✓ Doğru cevap:</span>
                  {eq.question.correctAnswer}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
