import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Search, Trash2, Users } from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import api from '../api/axios';
import {
  tokens, PageShell, Kicker, HeroTitle, SectionHeader, Btn, CodeTag,
  formatTrDateShort,
} from '../components/academic-ui';

type ActiveTab = 'exams' | 'questions' | 'submissions';

function statusTone(status: string) {
  switch (status) {
    case 'GRADED':     return { bg: '#ecfdf5', fg: tokens.good,   br: '#bbf7d0' };
    case 'SUBMITTED':  return { bg: tokens.indigoSoft, fg: tokens.indigo, br: tokens.indigoBorder };
    case 'IN_PROGRESS': return { bg: '#fff7ed', fg: '#9a3412',   br: '#fed7aa' };
    default:           return { bg: '#f1f3f6', fg: tokens.muted,  br: tokens.hairline };
  }
}

function Pill({ children, bg, fg, br }: { children: ReactNode; bg: string; fg: string; br?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, fontFamily: tokens.mono,
      background: bg, color: fg,
      border: `1px solid ${br ?? bg}`,
      whiteSpace: 'nowrap' as const,
    }}>{children}</span>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 18px', textAlign: 'left',
  fontFamily: tokens.mono, fontSize: 10.5,
  color: tokens.subtle, letterSpacing: '0.08em',
  textTransform: 'uppercase', fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '14px 18px', fontSize: 13.5, color: tokens.text,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as ActiveTab | null;
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    tabFromUrl && ['exams', 'questions', 'submissions'].includes(tabFromUrl)
      ? tabFromUrl
      : 'exams'
  );

  useEffect(() => {
    if (
      tabFromUrl &&
      ['exams', 'questions', 'submissions'].includes(tabFromUrl) &&
      tabFromUrl !== activeTab
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const {
    stats, roleCounts, exams, questions, studentExams, loading,
    search, setSearch,
    handleDeleteExam, handleDeleteQuestion,
    filteredExams, filteredQuestions, filteredStudentExams,
  } = useAdminDashboard();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>
        Admin paneli yükleniyor…
      </div>
    );
  }

  const tabs: { key: ActiveTab; label: string; count: number }[] = [
    { key: 'exams',       label: 'Sınavlar',   count: exams.length },
    { key: 'questions',   label: 'Sorular',    count: questions.length },
    { key: 'submissions', label: 'Katılımlar', count: studentExams.length },
  ];

  return (
    <PageShell maxWidth={1280}>

      {/* ── Hero ── */}
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

      {/* ── Stats grid ── */}
      {stats && (
        <section style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 28,
        }}>
          {[
            { label: 'Toplam Sınav',    value: String(stats.totalExams).padStart(2, '0'), accent: tokens.indigo },
            { label: 'Toplam Soru',     value: String(stats.totalQuestions).padStart(2, '0') },
            {
              label: 'Toplam Kullanıcı', value: String(stats.totalUsers ?? '—'),
              sub: roleCounts
                ? `${roleCounts.STUDENT} öğr · ${roleCounts.INSTRUCTOR} eğt · ${roleCounts.ADMIN} adm`
                : undefined,
            },
            { label: 'Aktif (30g)', value: String(stats.activeUsers ?? '—'), accent: '#16a34a', sub: 'son 30 günde giriş yapan' },
            { label: 'Katılım',       value: String(stats.totalStudentExams).padStart(2, '0'), sub: 'oturum' },
            {
              label: 'Tamamlanan', value: String(stats.completedExams).padStart(2, '0'),
              sub: stats.totalStudentExams > 0
                ? `%${Math.round((stats.completedExams / stats.totalStudentExams) * 100)} tamamlanma`
                : undefined,
            },
          ].map(({ label, value, accent, sub }) => (
            <div key={label} style={{
              background: '#fff', border: `1px solid ${tokens.hairline}`,
              borderRadius: 12, padding: '16px 18px',
            }}>
              <div style={{
                fontFamily: tokens.mono, fontSize: 10, color: tokens.subtle,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 6,
              }}>{label}</div>
              <div style={{
                fontSize: 30, fontWeight: 800, color: accent ?? tokens.ink,
                lineHeight: 1, letterSpacing: '-0.02em',
              }}>{value}</div>
              {sub && (
                <div style={{ fontSize: 11, color: tokens.subtle, marginTop: 6 }}>{sub}</div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Split layout: user distribution card + tabs/table ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: roleCounts ? '280px 1fr' : '1fr',
        gap: 24, alignItems: 'start',
      }}>

        {/* Kullanıcı Dağılımı */}
        {roleCounts && (
          <div style={{
            background: '#fff', border: `1px solid ${tokens.hairline}`,
            borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 22px 4px' }}>
              <div style={{
                fontFamily: tokens.mono, fontSize: 10,
                color: tokens.subtle, letterSpacing: '0.1em',
                textTransform: 'uppercase' as const, marginBottom: 4,
              }}>Roller</div>
              <h3 style={{
                margin: '4px 0 16px', fontFamily: tokens.serif,
                fontSize: 20, fontWeight: 400, color: tokens.ink,
                letterSpacing: '-0.015em',
              }}>Kullanıcı dağılımı</h3>

              {([
                ['Öğrenci',  roleCounts.STUDENT,     tokens.indigo],
                ['Eğitmen',  roleCounts.INSTRUCTOR,  tokens.good],
                ['Yönetici', roleCounts.ADMIN,        tokens.ink],
              ] as [string, number, string][]).map(([role, count, color]) => {
                const pct = roleCounts.total > 0 ? (count / roleCounts.total) * 100 : 0;
                return (
                  <div key={role} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: tokens.text }}>{role}</span>
                      <span style={{ fontFamily: tokens.mono, fontSize: 12, color: tokens.ink, fontWeight: 600 }}>
                        {count}
                        <span style={{ color: tokens.subtle, fontWeight: 400, marginLeft: 6 }}>
                          · %{pct.toFixed(1)}
                        </span>
                      </span>
                    </div>
                    <div style={{
                      height: 5, background: tokens.hairlineSoft,
                      borderRadius: 3, overflow: 'hidden',
                    }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Keycloak Sync */}
            <div style={{
              padding: '14px 22px 18px',
              borderTop: `1px solid ${tokens.hairlineSoft}`,
            }}>
              <Btn
                variant="outline"
                onClick={async () => {
                  if (confirm("Keycloak'taki tüm kullanıcıları database'e senkronize etmek istiyor musunuz?")) {
                    try {
                      const res = await api.post('/admin/users/sync-from-keycloak');
                      alert(res.data.message || 'Kullanıcılar senkronize edildi');
                      window.location.reload();
                    } catch {
                      alert('Senkronizasyon hatası!');
                    }
                  }
                }}
                icon={<Users size={14} />}
                style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '8px 12px' }}
              >
                Keycloak'tan Sync
              </Btn>
            </div>
          </div>
        )}

        {/* Tabs + table */}
        <div>
          {/* Tab bar + search */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, marginBottom: 18, flexWrap: 'wrap' as const,
            borderBottom: `1px solid ${tokens.hairline}`, paddingBottom: 0,
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {tabs.map(tab => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => switchTab(tab.key)}
                    style={{
                      padding: '10px 16px', background: 'none', border: 'none',
                      borderBottom: `2px solid ${active ? tokens.indigo : 'transparent'}`,
                      marginBottom: -1,
                      color: active ? tokens.indigo : tokens.muted,
                      fontWeight: active ? 700 : 500, fontSize: 13.5,
                      fontFamily: 'inherit', cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                    <span style={{
                      fontFamily: tokens.mono, fontSize: 11,
                      color: tokens.subtle, marginLeft: 6,
                    }}>({tab.count})</span>
                  </button>
                );
              })}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: '#fff',
              border: `1px solid ${tokens.hairline}`, borderRadius: 10,
              color: tokens.subtle, minWidth: 240, marginBottom: 8,
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

          {/* ── Exams tab ── */}
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
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
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
                              <Btn
                                onClick={() => navigate(`/admin/exam/${exam.id}`)}
                                icon={<Eye size={12} />}
                                style={{ padding: '6px 10px', fontSize: 12 }}
                              >Detay</Btn>
                              <Btn
                                variant="danger"
                                onClick={() => handleDeleteExam(exam.id)}
                                icon={<Trash2 size={12} />}
                                style={{ padding: '6px 10px', fontSize: 12 }}
                              >Sil</Btn>
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

          {/* ── Questions tab ── */}
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
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
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
                          <td style={{ ...tdStyle, color: tokens.ink, maxWidth: 460 }}>
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
                            <Btn
                              variant="danger"
                              onClick={() => handleDeleteQuestion(q.id)}
                              icon={<Trash2 size={12} />}
                              style={{ padding: '6px 10px', fontSize: 12 }}
                            >Sil</Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ── Submissions tab ── */}
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
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
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
                            <td style={{ ...tdStyle, color: tokens.muted, fontSize: 13 }}>
                              {item.student?.fullName || item.student?.username || item.student?.email || '—'}
                            </td>
                            <td style={tdStyle}>
                              <Pill bg={sm.bg} fg={sm.fg} br={sm.br}>{item.status}</Pill>
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
        </div>
      </div>
    </PageShell>
  );
}