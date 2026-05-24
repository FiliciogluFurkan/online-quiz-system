import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FolderOpen, Plus, FileText, Search } from 'lucide-react';
import api from '../api/axios';
import type { Exam } from '../types';
import {
  tokens, PageShell, Kicker, HeroTitle, Stat, SectionHeader, Btn, CodeTag,
} from '../components/academic-ui';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/exams').then(res => setExams(res.data));
  }, []);

  const published = useMemo(() => exams.filter(e => e.published).length, [exams]);
  const drafts = exams.length - published;

  const filtered = useMemo(
    () => exams.filter(e =>
      `${e.title} ${e.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
    ),
    [exams, search]
  );

  return (
    <PageShell>
      <section style={{ marginBottom: 32 }}>
        <Kicker>Eğitmen çalışma alanı</Kicker>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', gap: 24, marginTop: 8, flexWrap: 'wrap' as const,
        }}>
          <div>
            <HeroTitle>Eğitmen Paneli</HeroTitle>
            <p style={{
              margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
              fontSize: 15.5, lineHeight: 1.6,
            }}>
              Sınavlarını yönet, yeni değerlendirmeler oluştur ve yayın
              durumlarını tek ekrandan takip et.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <Btn variant="primary" onClick={() => navigate('/instructor/create-exam')} icon={<Plus size={14} />}>
              Yeni Sınav
            </Btn>
            <Btn onClick={() => navigate('/instructor/questions')} icon={<FileText size={14} />}>
              Soru Bankası
            </Btn>
            <Btn onClick={() => navigate('/instructor/categories')} icon={<FolderOpen size={14} />}>
              Kategoriler
            </Btn>
          </div>
        </div>
      </section>

      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48,
      }}>
        <Stat label="Toplam Sınav" value={String(exams.length).padStart(2, '0')} accent={tokens.indigo} />
        <Stat label="Yayında" value={String(published).padStart(2, '0')} sub="Aktif olarak öğrencilere açık" />
        <Stat label="Taslak" value={String(drafts).padStart(2, '0')} sub="Henüz yayınlanmadı" />
      </section>

      <section>
        <SectionHeader
          kicker="Sınavlarım"
          title="Tüm sınavlar"
          count={filtered.length}
          action={
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: '#fff',
              border: `1px solid ${tokens.hairline}`, borderRadius: 10,
              color: tokens.subtle, minWidth: 260,
            }}>
              <Search size={15} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Sınav ara…"
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  flex: 1, color: tokens.ink, fontFamily: 'inherit', fontSize: 13,
                }}
              />
            </div>
          }
        />

        {filtered.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center' as const,
            background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          }}>
            <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted, marginBottom: 8 }}>
              {exams.length === 0 ? 'Henüz sınav oluşturmadın' : 'Sınav bulunamadı'}
            </div>
            <div style={{ fontSize: 13.5, color: tokens.subtle, marginBottom: 18 }}>
              {exams.length === 0
                ? 'İlk sınavını oluşturarak öğrencilerin için değerlendirme sürecini başlatabilirsin.'
                : 'Farklı bir arama terimi deneyin.'}
            </div>
            {exams.length === 0 && (
              <Btn variant="primary" onClick={() => navigate('/instructor/create-exam')}
                icon={<Plus size={14} />}>İlk Sınavı Oluştur</Btn>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filtered.map(exam => (
              <article
                key={exam.id}
                onClick={() => navigate(`/instructor/exam/${exam.id}`)}
                style={{
                  background: tokens.card,
                  border: `1px solid ${tokens.hairline}`,
                  borderRadius: 14, padding: 22,
                  display: 'flex', flexDirection: 'column', gap: 14,
                  cursor: 'pointer', position: 'relative',
                  transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 14px 32px rgba(15,23,42,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <header style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: 12,
                }}>
                  <CodeTag tone={exam.published ? 'indigo' : 'slate'}>
                    {exam.published ? 'YAYINDA' : 'TASLAK'}
                  </CodeTag>
                  <span style={{
                    fontFamily: tokens.mono, fontSize: 11, color: tokens.subtle,
                    letterSpacing: '0.06em',
                  }}>#{String(exam.id).padStart(3, '0')}</span>
                </header>

                <h3 style={{
                  margin: 0, fontFamily: tokens.serif,
                  fontSize: 20, lineHeight: 1.25, color: tokens.ink,
                  fontWeight: 400, letterSpacing: '-0.01em',
                }}>{exam.title}</h3>

                {exam.description && (
                  <p style={{
                    margin: 0, fontSize: 13, color: tokens.muted,
                    lineHeight: 1.55,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  }}>{exam.description}</p>
                )}

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                  borderTop: `1px solid ${tokens.hairlineSoft}`,
                  padding: '12px 0 0',
                  marginTop: 'auto',
                }}>
                  {[
                    ['Süre', `${exam.duration} dk`],
                    ['Durum', exam.published ? 'Aktif' : 'Hazırlanıyor'],
                  ].map(([k, v], i) => (
                    <div key={k} style={{
                      padding: '0 14px',
                      borderLeft: i === 0 ? 'none' : `1px solid ${tokens.hairlineSoft}`,
                    }}>
                      <div style={{
                        fontFamily: tokens.mono, fontSize: 10, color: tokens.subtle,
                        textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                      }}>{k}</div>
                      <div style={{ fontSize: 14, color: '#2a2a36', fontWeight: 500, marginTop: 3 }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 4,
                }}>
                  <span style={{
                    fontFamily: tokens.mono, fontSize: 11, color: tokens.indigo,
                    letterSpacing: '0.06em', fontWeight: 600,
                  }}>YÖNET</span>
                  <ArrowRight size={14} style={{ color: tokens.indigo }} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
