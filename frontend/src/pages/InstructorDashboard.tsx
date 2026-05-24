import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FolderOpen, Plus, FileText, Search, Users } from 'lucide-react';
import api from '../api/axios';
import type { ExamWithStats } from '../types';
import {
  tokens, PageShell, Kicker, HeroTitle, Stat, SectionHeader, Btn, CodeTag,
} from '../components/academic-ui';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ExamWithStats[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/exams/with-stats').then(res => setRows(res.data));
  }, []);

  const totalExams = rows.length;
  const published = useMemo(() => rows.filter(r => r.exam.published).length, [rows]);
  const drafts = totalExams - published;
  const totalEnrolled = useMemo(
    () => rows.reduce((s, r) => s + (r.enrolledCount || 0), 0),
    [rows]
  );
  const avgAcrossExams = useMemo(() => {
    const withScores = rows.filter(r => r.avgScore != null);
    if (withScores.length === 0) return null;
    return Math.round(withScores.reduce((s, r) => s + (r.avgScore || 0), 0) / withScores.length);
  }, [rows]);

  const filtered = useMemo(
    () => rows.filter(r =>
      `${r.exam.title} ${r.exam.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
    ),
    [rows, search]
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
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48,
      }}>
        <Stat label="Toplam Sınav" value={String(totalExams).padStart(2, '0')} accent={tokens.indigo}
          sub={`${published} yayın · ${drafts} taslak`} />
        <Stat label="Toplam Katılım" value={String(totalEnrolled).padStart(2, '0')} sub="öğrenci oturumu" />
        <Stat label="Ortalama" value={avgAcrossExams != null ? String(avgAcrossExams) : '—'}
          sub={avgAcrossExams != null ? '/ 100 · tüm sınavlar' : 'henüz puan yok'} />
        <Stat label="Yayında" value={String(published).padStart(2, '0')} sub="aktif sınav" />
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
              {rows.length === 0 ? 'Henüz sınav oluşturmadın' : 'Sınav bulunamadı'}
            </div>
            <div style={{ fontSize: 13.5, color: tokens.subtle, marginBottom: 18 }}>
              {rows.length === 0
                ? 'İlk sınavını oluşturarak öğrencilerin için değerlendirme sürecini başlatabilirsin.'
                : 'Farklı bir arama terimi deneyin.'}
            </div>
            {rows.length === 0 && (
              <Btn variant="primary" onClick={() => navigate('/instructor/create-exam')}
                icon={<Plus size={14} />}>İlk Sınavı Oluştur</Btn>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filtered.map(row => {
              const exam = row.exam;
              return (
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
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    borderTop: `1px solid ${tokens.hairlineSoft}`,
                    padding: '12px 0 0',
                    marginTop: 'auto',
                  }}>
                    {[
                      ['Süre', `${exam.duration} dk`],
                      ['Katılım', String(row.enrolledCount ?? 0)],
                      ['Ort.', row.avgScore != null ? Math.round(row.avgScore).toString() : '—'],
                    ].map(([k, v], i) => (
                      <div key={k} style={{
                        padding: '0 12px',
                        borderLeft: i === 0 ? 'none' : `1px solid ${tokens.hairlineSoft}`,
                      }}>
                        <div style={{
                          fontFamily: tokens.mono, fontSize: 10, color: tokens.subtle,
                          textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                        }}>{k}</div>
                        <div style={{
                          fontSize: 14, color: '#2a2a36', fontWeight: 500, marginTop: 3,
                          fontFamily: i > 0 ? tokens.mono : undefined,
                        }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 4,
                  }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontFamily: tokens.mono, fontSize: 11, color: tokens.indigo,
                      letterSpacing: '0.06em', fontWeight: 600,
                    }}>
                      <Users size={12} /> {row.completedCount}/{row.enrolledCount} TAMAM
                    </span>
                    <ArrowRight size={14} style={{ color: tokens.indigo }} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
