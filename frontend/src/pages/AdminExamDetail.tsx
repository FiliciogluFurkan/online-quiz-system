import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import type { Exam, Question, AuditLogEntry } from '../types';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, SectionHeader, Btn, CodeTag,
  formatTrDate,
} from '../components/academic-ui';

interface ExamQuestion {
  id: number;
  question: Question;
  orderIndex: number;
}

const ACTION_TONE: Record<string, string> = {
  CREATE: tokens.indigo,
  UPDATE: tokens.indigo,
  PUBLISH: tokens.good,
  UNPUBLISH: '#b45309',
  DELETE: tokens.bad,
  GRADE: tokens.indigo,
};

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
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    Promise.allSettled([
      api.get(`/admin/exams/${id}`),
      api.get(`/exam-questions/exam/${id}/full`),
      api.get(`/admin/exams/${id}/audit-log`),
    ])
      .then(([examRes, qsRes, auditRes]) => {
        if (examRes.status === 'fulfilled') setExam(examRes.value.data);
        if (qsRes.status === 'fulfilled') setQuestions(qsRes.value.data);
        if (auditRes.status === 'fulfilled') setAuditLog(auditRes.value.data ?? []);
        if (examRes.status === 'rejected') {
          alert('Sınav detayları yüklenirken hata oluştu!');
        }
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

      {/* Owner + Audit log */}
      <section style={{
        marginTop: 48,
        display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start',
      }}>
        <aside style={{
          padding: 22, background: '#fff',
          border: `1px solid ${tokens.hairline}`, borderRadius: 12,
        }}>
          <Kicker>Sahip / Eğitmen</Kicker>

          {exam.instructor ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, marginBottom: 18 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: tokens.indigoSoft, color: '#3730a3',
                  display: 'grid', placeItems: 'center',
                  fontFamily: tokens.serif, fontSize: 17,
                }}>
                  {(exam.instructor.fullName || '?')
                    .split(/[\s.]+/).filter(Boolean).slice(0, 2)
                    .map(s => s[0]?.toUpperCase()).join('') || '?'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: tokens.ink, fontWeight: 500 }}>
                    {exam.instructor.fullName || 'Bilinmiyor'}
                  </div>
                  {exam.instructor.email && (
                    <div style={{
                      fontSize: 11.5, color: tokens.subtle, marginTop: 2,
                      fontFamily: tokens.mono,
                    }}>{exam.instructor.email}</div>
                  )}
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: `1px solid ${tokens.hairline}`, margin: '0 0 14px' }} />
            </>
          ) : (
            <div style={{
              marginTop: 14, marginBottom: 14, padding: 12,
              background: tokens.ivory, border: `1px solid ${tokens.hairlineSoft}`,
              borderRadius: 8, fontSize: 12.5, color: tokens.subtle,
            }}>Bu sınav için sahip bilgisi bulunmuyor (eski kayıt).</div>
          )}

          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['Oluşturulma', formatTrDate(exam.createdAt)],
              ['Sınav ID', `#${String(exam.id).padStart(3, '0')}`],
              ['Durum', exam.published ? 'Yayında' : 'Taslak'],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 12.5,
              }}>
                <span style={{ color: tokens.subtle }}>{k}</span>
                <span style={{
                  color: tokens.ink, fontWeight: 500, fontFamily: tokens.mono,
                }}>{v}</span>
              </div>
            ))}
          </div>
        </aside>

        <div>
          <SectionHeader
            kicker="Audit log"
            title="Son aktiviteler"
            count={auditLog.length}
            sub="Bu sınavda yapılan tüm değişikliklerin kaydı"
          />

          {auditLog.length === 0 ? (
            <div style={{
              padding: '32px 24px', textAlign: 'center' as const,
              background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 12,
              color: tokens.subtle, fontSize: 13.5,
            }}>Henüz aktivite kaydı yok.</div>
          ) : (
            <div style={{
              background: '#fff', border: `1px solid ${tokens.hairline}`,
              borderRadius: 12, overflow: 'hidden',
            }}>
              {auditLog.map((entry, i) => {
                const color = ACTION_TONE[entry.action?.toUpperCase()] ?? tokens.subtle;
                return (
                  <div key={entry.id} style={{
                    display: 'grid', gridTemplateColumns: '150px 1fr 130px 90px',
                    gap: 16, alignItems: 'center',
                    padding: '14px 18px',
                    borderBottom: i < auditLog.length - 1
                      ? `1px solid ${tokens.hairlineSoft}` : 'none',
                  }}>
                    <span style={{
                      fontFamily: tokens.mono, fontSize: 11.5, color: tokens.muted,
                    }}>{formatTrDate(entry.createdAt)}</span>
                    <span style={{ fontSize: 13, color: tokens.ink, lineHeight: 1.45 }}>
                      {entry.payload || `${entry.action} · ${entry.entityType}`}
                    </span>
                    <span style={{
                      fontSize: 12, color: tokens.muted,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>{entry.userName || (entry.userId != null ? `#${entry.userId}` : 'Sistem')}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 8px', borderRadius: 4,
                      background: '#fafafb', color,
                      fontSize: 10.5, fontFamily: tokens.mono,
                      fontWeight: 600, letterSpacing: '0.04em',
                      width: 'fit-content' as const,
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%', background: color,
                      }} />
                      {(entry.action || '').toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
