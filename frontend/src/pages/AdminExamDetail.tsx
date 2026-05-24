import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import type { Exam, Question } from '../types';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, SectionHeader, Btn, CodeTag,
  formatTrDate,
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

export default function AdminExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  useEffect(() => {
    Promise.all([
      api.get(`/admin/exams/${id}`),
      api.get(`/exam-questions/exam/${id}`),
    ])
      .then(([examRes, qsRes]) => {
        setExam(examRes.data);
        setQuestions(qsRes.data);
      })
      .catch(err => {
        console.error('Error loading exam detail:', err);
        alert('Sınav detayları yüklenirken hata oluştu!');
      });
  }, [id]);

  const totalPoints = useMemo(() =>
    questions.reduce((sum, item) => sum + (item.question.points || 0), 0),
    [questions]);

  if (!exam) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>Sınav detayları yükleniyor…</div>
    );
  }

  return (
    <PageShell>
      <Crumbs items={['Admin', 'Sınavlar', exam.title]} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 24, marginBottom: 8, flexWrap: 'wrap' as const,
      }}>
        <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate('/admin')}>
          Admin Paneline Dön
        </Btn>
        <CodeTag tone="ink">ADMIN GÖRÜNÜMÜ</CodeTag>
      </div>

      <section style={{ marginTop: 28, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <CodeTag tone={exam.published ? 'indigo' : 'slate'}>
            {exam.published ? 'YAYINDA' : 'TASLAK'}
          </CodeTag>
          <span style={{
            fontFamily: tokens.mono, fontSize: 11, color: tokens.subtle,
            letterSpacing: '0.06em',
          }}>#{String(exam.id).padStart(3, '0')}</span>
        </div>
        <HeroTitle accent={false}>{exam.title}</HeroTitle>
        <p style={{
          margin: '14px 0 0', maxWidth: 720, color: tokens.text,
          fontSize: 16, lineHeight: 1.65,
        }}>
          {exam.description || 'Bu sınav için henüz açıklama eklenmemiş.'}
        </p>

        <div style={{
          marginTop: 32, padding: '24px 0',
          borderTop: `1px solid ${tokens.hairline}`, borderBottom: `1px solid ${tokens.hairline}`,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
        }}>
          {[
            ['Süre', `${exam.duration} dk`],
            ['Soru', `${questions.length} · ${totalPoints} puan`],
            ['Başlangıç', formatTrDate(exam.startTime)],
            ['Bitiş', formatTrDate(exam.endTime)],
          ].map(([k, v]) => (
            <div key={k}>
              <Kicker>{k}</Kicker>
              <div style={{
                fontFamily: tokens.serif, fontSize: 22, color: tokens.ink,
                lineHeight: 1.2, letterSpacing: '-0.015em', marginTop: 6,
              }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <SectionHeader
        kicker="İçerik"
        title="Sınav soruları"
        count={questions.length}
        action={
          <span style={{ fontFamily: tokens.mono, fontSize: 12, color: tokens.muted }}>
            Toplam <strong style={{ color: tokens.ink }}>{totalPoints}</strong> puan
          </span>
        }
      />

      {questions.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center' as const,
          background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
        }}>
          <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted, marginBottom: 8 }}>
            Henüz soru eklenmemiş
          </div>
          <div style={{ fontSize: 13.5, color: tokens.subtle, maxWidth: 440, margin: '0 auto' }}>
            Bu sınava ait soru bulunmuyor.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {questions.map((eq, idx) => (
            <article key={eq.id} style={{
              padding: 22, background: '#fff',
              border: `1px solid ${tokens.hairline}`, borderRadius: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
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
                fontSize: 17, lineHeight: 1.45, color: tokens.ink, fontWeight: 400,
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

              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 8,
                fontSize: 13, color: tokens.good,
                fontFamily: tokens.mono,
              }}>
                <strong>✓ Doğru cevap:</strong> {eq.question.correctAnswer || '—'}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
