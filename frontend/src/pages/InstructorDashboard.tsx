import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Users, BarChart3, PlayCircle, Search, Bell, HelpCircle, MoreVertical, History, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import type { ExamWithStats } from '../types';
import { tokens, Btn } from '../components/academic-ui';
import { useAuth } from '../context/AuthContext';

function StatTile({ topBar, iconBg, iconColor, icon, label, value, caption }: {
  topBar: string; iconBg: string; iconColor: string; icon: ReactNode; label: string; value: string; caption: string;
}) {
  return (
    <div style={{
      background: tokens.card, borderRadius: 16, padding: 22, border: `1px solid ${tokens.hairline}`,
      boxShadow: '0 4px 24px -4px rgba(30,58,138,0.06)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: topBar }} />
      <span style={{ width: 46, height: 46, borderRadius: 12, background: iconBg, color: iconColor, display: 'grid', placeItems: 'center', marginBottom: 18 }}>{icon}</span>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: tokens.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: tokens.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</span>
        <span style={{ fontSize: 13, color: tokens.muted, fontWeight: 500 }}>{caption}</span>
      </div>
    </div>
  );
}

function StatusPill({ published }: { published: boolean }) {
  if (published) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#047857' }} />Yayında
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>Taslak</span>
  );
}

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<ExamWithStats[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/exams/with-stats').then(res => setRows(res.data));
  }, []);

  const totalExams = rows.length;
  const published = useMemo(() => rows.filter(r => r.exam.published).length, [rows]);
  const drafts = totalExams - published;
  const totalEnrolled = useMemo(() => rows.reduce((s, r) => s + (r.enrolledCount || 0), 0), [rows]);
  const avgAcrossExams = useMemo(() => {
    const withScores = rows.filter(r => r.avgScore != null);
    if (withScores.length === 0) return null;
    return Math.round(withScores.reduce((s, r) => s + (r.avgScore || 0), 0) / withScores.length);
  }, [rows]);

  const filtered = useMemo(
    () => rows.filter(r => `${r.exam.title} ${r.exam.description ?? ''}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  const initials = (user?.username || 'IN').slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        height: 72, position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(248,249,255,0.9)', backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${tokens.hairline}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px',
      }}>
        <div style={{
          flex: 1, maxWidth: 560, display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: tokens.ivory, borderRadius: 10,
        }}>
          <Search size={17} style={{ color: tokens.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sınav veya soru ara…"
            style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, color: tokens.ink, fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/notifications')} title="Bildirimler" style={iconBtn}><Bell size={18} /></button>
          <button title="Yardım" style={iconBtn}><HelpCircle size={18} /></button>
          <div style={{ width: 1, height: 28, background: tokens.hairline, margin: '0 8px' }} />
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: tokens.indigoSoft, color: tokens.indigo, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>{initials}</div>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '40px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>Eğitmen Paneli</h1>
            <p style={{ margin: '6px 0 0', color: tokens.muted, fontSize: 15 }}>Sınavlarınızı ve öğrenci performanslarını buradan yönetin.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn onClick={() => navigate('/instructor/questions')} icon={<FileText size={16} />} style={{ padding: '11px 18px', borderRadius: 12 }}>Soru Ekle</Btn>
            <Btn variant="primary" onClick={() => navigate('/instructor/create-exam')} icon={<Plus size={16} />} style={{ padding: '11px 18px', borderRadius: 12 }}>Yeni Sınav Oluştur</Btn>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <StatTile topBar={tokens.navy} iconBg="#e5eeff" iconColor={tokens.navy} icon={<FileText size={22} />} label="Toplam Sınav" value={String(totalExams)} caption={`${published} yayın · ${drafts} taslak`} />
          <StatTile topBar="#10b981" iconBg="#d1fae5" iconColor="#047857" icon={<PlayCircle size={22} />} label="Yayındaki Sınavlar" value={String(published)} caption="aktif olarak çözülen" />
          <StatTile topBar={tokens.indigo} iconBg="#e2dfff" iconColor={tokens.indigo} icon={<Users size={22} />} label="Toplam Katılım" value={String(totalEnrolled)} caption="öğrenci oturumu" />
          <StatTile topBar="#0ea5e9" iconBg="#e0f2fe" iconColor="#0369a1" icon={<BarChart3 size={22} />} label="Ortalama" value={avgAcrossExams != null ? String(avgAcrossExams) : '—'} caption={avgAcrossExams != null ? '/ 100 puan' : 'henüz puan yok'} />
        </div>

        {/* Son Sınavlar table */}
        <div style={{ background: tokens.card, borderRadius: 16, border: `1px solid ${tokens.hairline}`, boxShadow: '0 4px 24px -4px rgba(30,58,138,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${tokens.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <History size={20} style={{ color: tokens.navy }} />
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Son Sınavlar</h2>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: tokens.navy, fontWeight: 600, fontSize: 13.5 }}>Tümünü Gör <ArrowRight size={16} /></span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>{rows.length === 0 ? 'Henüz sınav oluşturmadın' : 'Sınav bulunamadı'}</div>
              <div style={{ fontSize: 13.5, color: tokens.subtle, marginBottom: 18 }}>{rows.length === 0 ? 'İlk sınavını oluşturarak başla.' : 'Farklı bir arama terimi dene.'}</div>
              {rows.length === 0 && <Btn variant="primary" onClick={() => navigate('/instructor/create-exam')} icon={<Plus size={15} />}>İlk Sınavı Oluştur</Btn>}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: tokens.ivory, borderBottom: `1px solid ${tokens.hairline}` }}>
                    {['Sınav Adı', 'Soru Sayısı', 'Süre', 'Durum', 'Sonuçlar', 'İşlemler'].map((h, i) => (
                      <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '14px 24px', fontSize: 11.5, fontWeight: 700, color: tokens.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => {
                    const exam = row.exam;
                    const enrolled = row.enrolledCount ?? 0;
                    const pct = enrolled ? Math.round((row.completedCount / enrolled) * 100) : 0;
                    return (
                      <tr key={exam.id} onClick={() => navigate(`/instructor/exam/${exam.id}`)}
                        style={{ borderBottom: `1px solid ${tokens.hairlineSoft}`, cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = tokens.card === '#ffffff' ? '#fbfcff' : tokens.ivory)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ width: 34, height: 34, borderRadius: 8, background: '#e5eeff', color: tokens.navy, display: 'grid', placeItems: 'center', flexShrink: 0 }}><FileText size={17} /></span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: tokens.ink, fontSize: 14 }}>{exam.title}</div>
                              {exam.description && <div style={{ fontSize: 12, color: tokens.subtle, marginTop: 1, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: 13.5, color: tokens.muted }}>{row.questionCount != null ? `${row.questionCount} Soru` : '—'}</td>
                        <td style={{ padding: '16px 24px', fontSize: 13.5, color: tokens.muted }}>{exam.duration} Dk</td>
                        <td style={{ padding: '16px 24px' }}><StatusPill published={!!exam.published} /></td>
                        <td style={{ padding: '16px 24px' }}>
                          {enrolled > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 64, height: 7, borderRadius: 99, background: '#d3e4fe', overflow: 'hidden' }}>
                                <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: tokens.navy }} />
                              </span>
                              <span style={{ fontSize: 12, color: tokens.text, fontWeight: 600 }}>{row.completedCount}/{enrolled}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, color: tokens.subtle, fontStyle: 'italic' }}>Bekleniyor</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button onClick={e => { e.stopPropagation(); navigate(`/instructor/exam/${exam.id}`); }}
                            title="Detay" style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'transparent', color: tokens.muted, cursor: 'pointer', display: 'inline-grid', placeItems: 'center' }}>
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'transparent',
  color: tokens.muted, display: 'grid', placeItems: 'center', cursor: 'pointer',
};
