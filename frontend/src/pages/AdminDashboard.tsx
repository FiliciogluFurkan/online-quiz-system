import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, Trash2 } from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import {
  tokens, PageShell, Kicker, HeroTitle, Stat, SectionHeader, Btn, CodeTag,
  formatTrDateShort,
} from '../components/academic-ui';

type ActiveTab = 'exams' | 'questions' | 'submissions';

function statusTone(status: string) {
  switch (status) {
    case 'GRADED': return { bg: '#ecfdf5', fg: tokens.good, br: '#bbf7d0' };
    case 'SUBMITTED': return { bg: tokens.indigoSoft, fg: tokens.indigo, br: tokens.indigoBorder };
    case 'IN_PROGRESS': return { bg: '#fff7ed', fg: '#9a3412', br: '#fed7aa' };
    default: return { bg: '#f1f3f6', fg: tokens.muted, br: tokens.hairline };
  }
}

const thStyle = {
  padding: '12px 18px', textAlign: 'left' as const,
  fontFamily: tokens.mono, fontSize: 10.5,
  color: tokens.subtle, letterSpacing: '0.08em',
  textTransform: 'uppercase' as const, fontWeight: 600,
};

const tdStyle = {
  padding: '14px 18px', fontSize: 13.5, color: tokens.text,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('exams');
  const {
    stats, exams, questions, studentExams, loading,
    search, setSearch,
    handleDeleteExam, handleDeleteQuestion,
    filteredExams, filteredQuestions, filteredStudentExams,
  } = useAdminDashboard();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>Admin paneli yükleniyor…</div>
    );
  }

  const tabs: { key: ActiveTab; label: string; count: number }[] = [
    { key: 'exams', label: 'Sınavlar', count: exams.length },
    { key: 'questions', label: 'Sorular', count: questions.length },
    { key: 'submissions', label: 'Katılımlar', count: studentExams.length },
  ];

  return (
    <PageShell maxWidth={1280}>
      <section style={{ marginBottom: 32 }}>
        <Kicker>Yönetim merkezi</Kicker>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', gap: 24, marginTop: 8, flexWrap: 'wrap' as const,
        }}>
          <div>
            <HeroTitle>Admin Paneli</HeroTitle>
            <p style={{
              margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
              fontSize: 15.5, lineHeight: 1.6,
            }}>
              Sınavları, soru havuzunu ve öğrenci katılımlarını tek ekrandan takip et.
            </p>
          </div>
          <CodeTag tone="indigo">SİSTEM AKTİF</CodeTag>
        </div>
      </section>

      {stats && (
        <section style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48,
        }}>
          <Stat label="Toplam Sınav" value={String(stats.totalExams).padStart(2, '0')} accent={tokens.indigo} />
          <Stat label="Toplam Soru" value={String(stats.totalQuestions).padStart(2, '0')} />
          <Stat label="Katılım" value={String(stats.totalStudentExams).padStart(2, '0')} sub="oturum" />
          <Stat label="Tamamlanan" value={String(stats.completedExams).padStart(2, '0')} sub="sonuç verildi" />
        </section>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 24, flexWrap: 'wrap' as const,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 14px', borderRadius: 999,
                background: activeTab === tab.key ? tokens.ink : '#fff',
                color: activeTab === tab.key ? '#fff' : tokens.text,
                border: `1px solid ${activeTab === tab.key ? tokens.ink : tokens.hairline}`,
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}>
              {tab.label}
              <span style={{
                fontFamily: tokens.mono, fontSize: 10.5,
                color: activeTab === tab.key ? '#9a9aa6' : tokens.subtle,
                fontWeight: 500,
              }}>{String(tab.count).padStart(2, '0')}</span>
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', background: '#fff',
          border: `1px solid ${tokens.hairline}`, borderRadius: 10,
          color: tokens.subtle, minWidth: 280,
        }}>
          <Search size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Listede ara…"
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              flex: 1, color: tokens.ink, fontFamily: 'inherit', fontSize: 13,
            }}
          />
        </div>
      </div>

      {activeTab === 'exams' && (
        <section>
          <SectionHeader kicker="Tüm sınavlar" title="Sistem geneli" count={filteredExams.length} />
          {filteredExams.length === 0 ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center' as const,
              background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
              color: tokens.subtle,
            }}>Sınav bulunamadı.</div>
          ) : (
            <div style={{
              background: '#fff', border: `1px solid ${tokens.hairline}`,
              borderRadius: 12, overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
                <thead style={{ background: tokens.ivory, borderBottom: `1px solid ${tokens.hairline}` }}>
                  <tr>{['ID', 'Başlık', 'Süre', 'Durum', 'İşlem'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filteredExams.map((exam, idx) => (
                    <tr key={exam.id} style={{
                      borderTop: idx === 0 ? 'none' : `1px solid ${tokens.hairlineSoft}`,
                    }}>
                      <td style={{ ...tdStyle, fontFamily: tokens.mono, color: tokens.subtle }}>
                        #{String(exam.id).padStart(3, '0')}
                      </td>
                      <td style={{ ...tdStyle, color: tokens.ink, fontWeight: 500 }}>{exam.title}</td>
                      <td style={{ ...tdStyle, fontFamily: tokens.mono, color: tokens.muted }}>
                        {exam.duration} dk
                      </td>
                      <td style={tdStyle}>
                        <CodeTag tone={exam.published ? 'indigo' : 'slate'}>
                          {exam.published ? 'YAYINDA' : 'TASLAK'}
                        </CodeTag>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Btn onClick={() => navigate(`/admin/exam/${exam.id}`)}
                            icon={<Eye size={12} />}
                            style={{ padding: '6px 10px', fontSize: 12 }}>Detay</Btn>
                          <Btn variant="danger" onClick={() => handleDeleteExam(exam.id)}
                            icon={<Trash2 size={12} />}
                            style={{ padding: '6px 10px', fontSize: 12 }}>Sil</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'questions' && (
        <section>
          <SectionHeader kicker="Tüm sorular" title="Soru havuzu" count={filteredQuestions.length} />
          {filteredQuestions.length === 0 ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center' as const,
              background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
              color: tokens.subtle,
            }}>Soru bulunamadı.</div>
          ) : (
            <div style={{
              background: '#fff', border: `1px solid ${tokens.hairline}`,
              borderRadius: 12, overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
                <thead style={{ background: tokens.ivory, borderBottom: `1px solid ${tokens.hairline}` }}>
                  <tr>{['ID', 'Soru', 'Tip', 'Puan', 'İşlem'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q, idx) => (
                    <tr key={q.id} style={{
                      borderTop: idx === 0 ? 'none' : `1px solid ${tokens.hairlineSoft}`,
                    }}>
                      <td style={{ ...tdStyle, fontFamily: tokens.mono, color: tokens.subtle }}>
                        #{String(q.id).padStart(3, '0')}
                      </td>
                      <td style={{ ...tdStyle, color: tokens.ink, maxWidth: 520 }}>
                        {q.questionText.length > 100
                          ? `${q.questionText.substring(0, 100)}…`
                          : q.questionText}
                      </td>
                      <td style={tdStyle}>
                        <CodeTag tone="slate">{q.type.replace('_', ' ')}</CodeTag>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: tokens.mono, color: tokens.ink, fontWeight: 600 }}>
                        {q.points}
                      </td>
                      <td style={tdStyle}>
                        <Btn variant="danger" onClick={() => handleDeleteQuestion(q.id)}
                          icon={<Trash2 size={12} />}
                          style={{ padding: '6px 10px', fontSize: 12 }}>Sil</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'submissions' && (
        <section>
          <SectionHeader kicker="Katılımlar" title="Tüm oturumlar" count={filteredStudentExams.length} />
          {filteredStudentExams.length === 0 ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center' as const,
              background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
              color: tokens.subtle,
            }}>Katılım bulunamadı.</div>
          ) : (
            <div style={{
              background: '#fff', border: `1px solid ${tokens.hairline}`,
              borderRadius: 12, overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
                <thead style={{ background: tokens.ivory, borderBottom: `1px solid ${tokens.hairline}` }}>
                  <tr>{['ID', 'Sınav', 'Kullanıcı', 'Durum', 'Puan', 'Tarih'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filteredStudentExams.map((item, idx) => {
                    const sm = statusTone(item.status);
                    return (
                      <tr key={item.id} style={{
                        borderTop: idx === 0 ? 'none' : `1px solid ${tokens.hairlineSoft}`,
                      }}>
                        <td style={{ ...tdStyle, fontFamily: tokens.mono, color: tokens.subtle }}>
                          #{String(item.id).padStart(3, '0')}
                        </td>
                        <td style={{ ...tdStyle, color: tokens.ink, fontWeight: 500 }}>
                          {item.exam?.title || '—'}
                        </td>
                        <td style={{ ...tdStyle, fontFamily: tokens.mono, color: tokens.muted, fontSize: 12 }}>
                          {item.keycloakUserId?.substring(0, 12) ?? '—'}…
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-flex', padding: '3px 8px', borderRadius: 4,
                            background: sm.bg, color: sm.fg, border: `1px solid ${sm.br}`,
                            fontSize: 11, fontWeight: 600, fontFamily: tokens.mono,
                          }}>{item.status}</span>
                        </td>
                        <td style={{ ...tdStyle, fontFamily: tokens.mono, color: tokens.ink, fontWeight: 600 }}>
                          {item.score ?? '—'}
                        </td>
                        <td style={{ ...tdStyle, fontFamily: tokens.mono, fontSize: 12, color: tokens.muted }}>
                          {formatTrDateShort(item.submittedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}
