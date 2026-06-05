import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Search, Trash2, Users } from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import api from '../api/axios';
import {
  tokens, PageShell, Kicker, HeroTitle, Stat, SectionHeader, Btn, CodeTag,
  formatTrDateShort,
} from '../components/academic-ui';
import { tokens, Btn, formatTrDateShort } from '../components/academic-ui';

type ActiveTab = 'exams' | 'questions' | 'submissions';

function statusTone(status: string) {
  switch (status) {
    case 'GRADED': return { bg: '#ecfdf5', fg: tokens.good };
    case 'SUBMITTED': return { bg: tokens.indigoSoft, fg: tokens.indigo };
    case 'IN_PROGRESS': return { bg: '#fff7ed', fg: '#9a3412' };
    default: return { bg: '#f1f3f6', fg: tokens.muted };
  }
}

function Pill({ children, bg, fg }: { children: ReactNode; bg: string; fg: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, background: bg, color: fg, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function AdminStat({ label, value, caption, accent }: {
  label: string; value: string; caption?: string; accent?: string;
}) {
  return (
    <div style={{
      background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14,
      padding: 18, boxShadow: '0 4px 12px rgba(30,58,138,0.04)',
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: tokens.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, color: accent ?? tokens.navy, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      {caption && <div style={{ fontSize: 11.5, color: tokens.subtle, marginTop: 8 }}>{caption}</div>}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left', fontSize: 11, color: tokens.muted,
  letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700,
  borderBottom: `1px solid ${tokens.hairline}`,
};
const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: 13.5, color: tokens.text };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as ActiveTab | null;
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    tabFromUrl && ['exams', 'questions', 'submissions'].includes(tabFromUrl) ? tabFromUrl : 'exams'
  );

  useEffect(() => {
    if (tabFromUrl && ['exams', 'questions', 'submissions'].includes(tabFromUrl) && tabFromUrl !== activeTab) {
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
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: tokens.bg, color: tokens.muted }}>
        Admin paneli yükleniyor…
      </div>
    );
  }

  const tabs: { key: ActiveTab; label: string; count: number }[] = [
    { key: 'exams', label: 'Sınavlar', count: exams.length },
    { key: 'questions', label: 'Sorular', count: questions.length },
    { key: 'submissions', label: 'Katılımlar', count: studentExams.length },
  ];

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 36px 56px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 26 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Admin Paneli<span style={{ color: tokens.indigo }}>.</span>
            </h1>
            <p style={{ margin: '8px 0 0', color: tokens.muted, fontSize: 15 }}>
              Sınavları, soru havuzunu ve öğrenci katılımlarını tek ekrandan takip et.
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px',
            borderRadius: 999, background: tokens.card, border: `1px solid ${tokens.hairline}`,
            fontSize: 12, fontWeight: 700, color: tokens.navy,
          }}>
            <Stat label="Toplam Sınav" value={String(stats.totalExams).padStart(2, '0')} accent={tokens.indigo} />
            <Stat label="Toplam Soru" value={String(stats.totalQuestions).padStart(2, '0')} />
            <Stat label="Toplam Kullanıcı" value={String(stats.totalUsers ?? '—')}
              sub={roleCounts ? `${roleCounts.STUDENT} öğr · ${roleCounts.INSTRUCTOR} eğt · ${roleCounts.ADMIN} adm` : undefined} />
            <Stat label="Aktif (30g)" value={String(stats.activeUsers ?? '—')}
              accent="#16a34a" sub="son 30 günde giriş yapan" />
            <Stat label="Katılım" value={String(stats.totalStudentExams).padStart(2, '0')} sub="oturum" />
            <Stat label="Tamamlanan" value={String(stats.completedExams).padStart(2, '0')}
              sub={stats.totalStudentExams > 0
                ? `%${Math.round((stats.completedExams / stats.totalStudentExams) * 100)} tamamlanma`
                : undefined} />
          </section>

          {roleCounts && (
            <section style={{
              padding: 22, background: '#fff',
              border: `1px solid ${tokens.hairline}`, borderRadius: 12,
              marginBottom: 32,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <div style={{
                    fontFamily: tokens.mono, fontSize: 10,
                    color: tokens.subtle, letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const, marginBottom: 4,
                  }}>Roller</div>
                  <h3 style={{
                    margin: '4px 0 0', fontFamily: tokens.serif,
                    fontSize: 22, fontWeight: 400, color: tokens.ink,
                    letterSpacing: '-0.015em',
                  }}>Kullanıcı dağılımı</h3>
                </div>
                <Btn 
                  variant="outline" 
                  onClick={async () => {
                    if (confirm('Keycloak\'taki tüm kullanıcıları database\'e senkronize etmek istiyor musunuz?')) {
                      try {
                        const res = await api.post('/admin/users/sync-from-keycloak');
                        alert(res.data.message || 'Kullanıcılar senkronize edildi');
                        window.location.reload();
                      } catch (err) {
                        alert('Senkronizasyon hatası!');
                      }
                    }
                  }}
                  icon={<Users size={14} />}
                  style={{ fontSize: 12, padding: '8px 12px' }}
                >
                  Keycloak'tan Sync
                </Btn>
              </div>
              {([
                ['Öğrenci', roleCounts.STUDENT, tokens.indigo],
                ['Eğitmen', roleCounts.INSTRUCTOR, tokens.good],
                ['Yönetici', roleCounts.ADMIN, tokens.ink],
              ] as [string, number, string][]).map(([role, count, color]) => {
                const pct = roleCounts.total > 0
                  ? (count / roleCounts.total) * 100
                  : 0;
                return (
                  <div key={role} style={{ marginBottom: 14 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', marginBottom: 5,
                    }}>
                      <span style={{ fontSize: 13, color: tokens.text }}>{role}</span>
                      <span style={{
                        fontFamily: tokens.mono, fontSize: 12,
                        color: tokens.ink, fontWeight: 600,
                      }}>
                        {count}
                        <span style={{
                          color: tokens.subtle, fontWeight: 400, marginLeft: 6,
                        }}>· %{pct.toFixed(1)}</span>
                      </span>
                    </div>
                    <div style={{
                      height: 5, background: tokens.hairlineSoft,
                      borderRadius: 3, overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', background: color,
                      }} />
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 24, flexWrap: 'wrap' as const,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
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
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: tokens.good }} /> SİSTEM AKTİF
          </span>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
            <AdminStat label="Toplam Sınav" value={String(stats.totalExams)} />
            <AdminStat label="Toplam Sınıf" value={String(stats.totalClassrooms ?? '—')} />
            <AdminStat label="Toplam Kullanıcı" value={String(stats.totalUsers ?? '—')}
              caption={roleCounts ? `${roleCounts.STUDENT} öğr · ${roleCounts.INSTRUCTOR} eğt · ${roleCounts.ADMIN} adm` : undefined} />
            <AdminStat label="Aktif (30g)" value={String(stats.activeUsers ?? '—')} caption="son 30 günde giriş yapan" />
            <AdminStat label="Katılım" value={String(stats.totalStudentExams)} caption="oturum" />
            <AdminStat label="Tamamlanan" value={String(stats.completedExams)}
              caption={stats.totalStudentExams > 0 ? `%${Math.round((stats.completedExams / stats.totalStudentExams) * 100)} tamamlanma` : undefined} />
          </div>
        )}

        {/* Split: distribution + tabs/table */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Kullanıcı Dağılımı */}
          {roleCounts ? (
            <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
              <div style={{ height: 4, background: tokens.navy }} />
              <div style={{ padding: 22 }}>
                <h3 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 700 }}>Kullanıcı Dağılımı</h3>
                {([
                  ['Öğrenci', roleCounts.STUDENT, tokens.indigo],
                  ['Eğitmen', roleCounts.INSTRUCTOR, tokens.navy],
                  ['Yönetici', roleCounts.ADMIN, '#94a3b8'],
                ] as [string, number, string][]).map(([role, count, color]) => {
                  const pct = roleCounts.total > 0 ? (count / roleCounts.total) * 100 : 0;
                  return (
                    <div key={role} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{role}</span>
                        <span style={{ fontSize: 12, color: tokens.muted, fontWeight: 600 }}>{count} · %{pct.toFixed(0)}</span>
                      </div>
                      <div style={{ height: 7, background: tokens.hairlineSoft, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <div />}

          {/* Tabs + search + table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap', borderBottom: `1px solid ${tokens.hairline}` }}>
              <div style={{ display: 'flex', gap: 24 }}>
                {tabs.map(tab => {
                  const active = activeTab === tab.key;
                  return (
                    <button key={tab.key} onClick={() => switchTab(tab.key)} style={{
                      padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: `2px solid ${active ? tokens.navy : 'transparent'}`, marginBottom: -1,
                      color: active ? tokens.navy : tokens.muted, fontWeight: active ? 700 : 600, fontSize: 14, fontFamily: 'inherit',
                    }}>
                      {tab.label} <span style={{ color: tokens.subtle, fontWeight: 600 }}>({tab.count})</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 10, minWidth: 220, marginBottom: 8 }}>
                <Search size={15} style={{ color: tokens.subtle }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Listede ara…"
                  style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, color: tokens.ink, fontFamily: 'inherit', fontSize: 13 }} />
              </div>
            </div>

            <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
              <div style={{ overflowX: 'auto' }}>
                {activeTab === 'exams' && (
                  filteredExams.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: tokens.subtle }}>Sınav bulunamadı.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: tokens.ivory }}>
                        <tr>{['ID', 'Başlık', 'Süre', 'Durum', 'İşlem'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {filteredExams.map(exam => (
                          <tr key={exam.id} style={{ borderTop: `1px solid ${tokens.hairlineSoft}` }}>
                            <td style={{ ...tdStyle, color: tokens.subtle }}>#{String(exam.id).padStart(3, '0')}</td>
                            <td style={{ ...tdStyle, color: tokens.ink, fontWeight: 600 }}>{exam.title}</td>
                            <td style={{ ...tdStyle, color: tokens.muted }}>{exam.duration} dk</td>
                            <td style={tdStyle}>
                              {exam.published
                                ? <Pill bg="#e8f0ff" fg={tokens.navy}>YAYINDA</Pill>
                                : <Pill bg="#fff4e5" fg={tokens.warn}>TASLAK</Pill>}
                            </td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <Btn onClick={() => navigate(`/admin/exam/${exam.id}`)} icon={<Eye size={12} />} style={{ padding: '6px 10px', fontSize: 12 }}>Detay</Btn>
                                <Btn variant="danger" onClick={() => handleDeleteExam(exam.id)} icon={<Trash2 size={12} />} style={{ padding: '6px 10px', fontSize: 12 }}>Sil</Btn>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}

                {activeTab === 'questions' && (
                  filteredQuestions.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: tokens.subtle }}>Soru bulunamadı.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: tokens.ivory }}>
                        <tr>{['ID', 'Soru', 'Tip', 'Puan', 'İşlem'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {filteredQuestions.map(q => (
                          <tr key={q.id} style={{ borderTop: `1px solid ${tokens.hairlineSoft}` }}>
                            <td style={{ ...tdStyle, color: tokens.subtle }}>#{String(q.id).padStart(3, '0')}</td>
                            <td style={{ ...tdStyle, color: tokens.ink, maxWidth: 460 }}>
                              {q.questionText.length > 100 ? `${q.questionText.substring(0, 100)}…` : q.questionText}
                            </td>
                            <td style={tdStyle}><Pill bg={tokens.ivory} fg={tokens.text}>{q.type.replace('_', ' ')}</Pill></td>
                            <td style={{ ...tdStyle, color: tokens.ink, fontWeight: 700 }}>{q.points}</td>
                            <td style={tdStyle}>
                              <Btn variant="danger" onClick={() => handleDeleteQuestion(q.id)} icon={<Trash2 size={12} />} style={{ padding: '6px 10px', fontSize: 12 }}>Sil</Btn>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}

                {activeTab === 'submissions' && (
                  filteredStudentExams.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: tokens.subtle }}>Katılım bulunamadı.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: tokens.ivory }}>
                        <tr>{['ID', 'Sınav', 'Kullanıcı', 'Durum', 'Puan', 'Tarih'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {filteredStudentExams.map(item => {
                          const sm = statusTone(item.status);
                          return (
                            <tr key={item.id} style={{ borderTop: `1px solid ${tokens.hairlineSoft}` }}>
                              <td style={{ ...tdStyle, color: tokens.subtle }}>#{String(item.id).padStart(3, '0')}</td>
                              <td style={{ ...tdStyle, color: tokens.ink, fontWeight: 600 }}>{item.exam?.title || '—'}</td>
                              <td style={{ ...tdStyle, color: tokens.muted }}>{item.student?.fullName || item.student?.username || item.student?.email || '—'}</td>
                              <td style={tdStyle}><Pill bg={sm.bg} fg={sm.fg}>{item.status}</Pill></td>
                              <td style={{ ...tdStyle, color: tokens.ink, fontWeight: 700 }}>{item.score ?? '—'}</td>
                              <td style={{ ...tdStyle, fontSize: 12, color: tokens.muted }}>{formatTrDateShort(item.submittedAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
