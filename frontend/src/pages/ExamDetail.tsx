import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Eye, BarChart3, FileText, Send, ToggleLeft, Pencil } from 'lucide-react';
import api from '../api/axios';
import type { Exam, Question } from '../types';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, Btn, SectionHeader, CodeTag,
  formatTrDate,
} from '../components/academic-ui';

interface ExamQuestion {
  id: number;
  question: Question;
  orderIndex: number;
}

function getQuestionTypeLabel(type: string): string {
  if (type === 'MULTIPLE_CHOICE') return 'Çoktan Seçmeli';
  if (type === 'TRUE_FALSE') return 'Doğru / Yanlış';
  return 'Kısa Cevap';
}

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);

  useEffect(() => {
    api.get(`/exams/${id}`).then(res => setExam(res.data)).catch(console.error);
    loadQuestions();
  }, [id]);

  const loadQuestions = () => {
    api.get(`/exam-questions/exam/${id}`)
      .then(res => setExamQuestions(res.data))
      .catch(console.error);
  };

  const totalPoints = useMemo(
    () => examQuestions.reduce((sum, item) => sum + (item.question.points || 0), 0),
    [examQuestions]
  );

  const [busy, setBusy] = useState(false);

  const handlePublish = async () => {
    if (!exam || busy) return;
    if (examQuestions.length === 0) {
      alert('Sorusu olmayan sınav yayınlanamaz. Önce soru ekle.');
      return;
    }
    if (!window.confirm('Sınavı yayınlamak istediğine emin misin? Yayınladıktan sonra öğrenciler katılabilir.')) return;
    setBusy(true);
    try {
      await api.put(`/exams/${id}`, { ...exam, published: true });
      navigate('/instructor');
    } catch (error) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Sınav yayınlanırken hata oluştu.';
      alert(msg);
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const handleUnpublish = async () => {
    if (!exam || busy) return;
    setBusy(true);
    try {
      await api.put(`/exams/${id}`, { ...exam, published: false });
      setExam({ ...exam, published: false });
    } catch (error) {
      alert('Yayından kaldırılırken hata oluştu.');
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  if (!exam) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>Yükleniyor…</div>
    );
  }

  return (
    <PageShell>
      <Crumbs items={['Eğitmen', 'Sınavlar', exam.title]} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 24, marginBottom: 8, flexWrap: 'wrap' as const,
      }}>
        <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate('/instructor')}>
          Eğitmen Paneli
        </Btn>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {!exam.published ? (
            <Btn
              variant="primary"
              onClick={handlePublish}
              disabled={busy || examQuestions.length === 0}
              title={examQuestions.length === 0 ? 'Önce soru ekle' : undefined}
              icon={<Send size={14} />}>
              {busy ? 'Yayınlanıyor…' : 'Yayınla'}
            </Btn>
          ) : (
            <Btn onClick={handleUnpublish} disabled={busy} icon={<ToggleLeft size={14} />}>
              {busy ? 'İşleniyor…' : 'Yayından Kaldır'}
            </Btn>
          )}
          <Btn onClick={() => navigate(`/instructor/exam/${id}/edit`)} icon={<Pencil size={14} />}>
            Düzenle
          </Btn>
          <Btn onClick={() => navigate(`/instructor/exam/${id}/add-questions`)} icon={<Plus size={14} />}>
            Soru Ekle
          </Btn>
          <Btn onClick={() => navigate(`/instructor/exam/${id}/preview`)} icon={<Eye size={14} />}>
            Önizle
          </Btn>
          <Btn onClick={() => navigate(`/instructor/exam/${id}/results`)} icon={<FileText size={14} />}>
            Sonuçlar
          </Btn>
          <Btn onClick={() => navigate(`/instructor/exam/${id}/statistics`)} icon={<BarChart3 size={14} />}>
            İstatistikler
          </Btn>
        </div>
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
            ['Süre', `${exam.duration} dk`, 'kesintisiz'],
            ['Soru', String(examQuestions.length), `${totalPoints} toplam puan`],
            ['Başlangıç', formatTrDate(exam.startTime), exam.startTime ? '' : 'belirlenmedi'],
            ['Bitiş', formatTrDate(exam.endTime), exam.endTime ? '' : 'belirlenmedi'],
          ].map(([k, v, s]) => (
            <div key={k}>
              <Kicker>{k}</Kicker>
              <div style={{
                fontFamily: tokens.serif, fontSize: 24, color: tokens.ink,
                lineHeight: 1.2, letterSpacing: '-0.015em', marginTop: 6,
              }}>{v}</div>
              {s && (
                <div style={{ fontSize: 11.5, color: tokens.subtle, marginTop: 4 }}>{s}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          kicker="İçerik"
          title="Sorular"
          count={examQuestions.length}
          action={
            <span style={{
              fontFamily: tokens.mono, fontSize: 12, color: tokens.muted,
            }}>Toplam <strong style={{ color: tokens.ink }}>{totalPoints}</strong> puan</span>
          }
        />

        {examQuestions.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center' as const,
            background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          }}>
            <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted, marginBottom: 8 }}>
              Henüz soru eklenmemiş
            </div>
            <div style={{
              fontSize: 13.5, color: tokens.subtle, marginBottom: 18, maxWidth: 440,
              margin: '0 auto 18px',
            }}>
              Bu sınavı yayınlamadan önce soru ekleyerek sınav içeriğini tamamlayabilirsin.
            </div>
            <Btn variant="primary"
              onClick={() => navigate(`/instructor/exam/${id}/add-questions`)}
              icon={<Plus size={14} />}>İlk Soruyu Ekle</Btn>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {examQuestions.map((eq, idx) => (
              <article key={eq.id} style={{
                padding: 20, background: '#fff',
                border: `1px solid ${tokens.hairline}`, borderRadius: 12,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: tokens.ink, color: '#fff',
                    display: 'grid', placeItems: 'center',
                    fontFamily: tokens.mono, fontSize: 12, fontWeight: 600,
                  }}>{String(idx + 1).padStart(2, '0')}</span>
                  <CodeTag tone="slate">{getQuestionTypeLabel(eq.question.type)}</CodeTag>
                  <span style={{ fontSize: 12, color: tokens.subtle }}>{eq.question.points} puan</span>
                </div>

                <p style={{
                  margin: 0, fontFamily: tokens.serif,
                  fontSize: 17, lineHeight: 1.45, color: tokens.ink, fontWeight: 400,
                }}>{eq.question.questionText}</p>

                {eq.question.options && (
                  <pre style={{
                    margin: '14px 0 0', padding: '10px 12px',
                    background: '#fafafb', border: `1px solid ${tokens.hairlineSoft}`,
                    borderRadius: 8, fontFamily: tokens.mono,
                    fontSize: 12.5, color: tokens.text,
                    whiteSpace: 'pre-wrap' as const, lineHeight: 1.6,
                  }}>{eq.question.options}</pre>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
