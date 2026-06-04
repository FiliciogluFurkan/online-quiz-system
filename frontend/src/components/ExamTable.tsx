import { useNavigate } from 'react-router-dom';
import { FileText, MoreVertical } from 'lucide-react';
import type { ExamWithStats } from '../types';
import { tokens } from './academic-ui';

export function StatusPill({ published }: { published: boolean }) {
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

export function ExamTable({ rows }: { rows: ExamWithStats[] }) {
  const navigate = useNavigate();
  return (
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
          {rows.map(row => {
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
  );
}
