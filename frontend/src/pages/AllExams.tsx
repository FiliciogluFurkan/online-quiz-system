import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, ClipboardList } from 'lucide-react';
import api from '../api/axios';
import type { ExamWithStats } from '../types';
import { tokens, Btn } from '../components/academic-ui';
import { ExamTable } from '../components/ExamTable';

export default function AllExams() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ExamWithStats[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/exams/with-stats').then(res => setRows(res.data)).catch(() => setRows([]));
  }, []);

  const filtered = useMemo(
    () => rows.filter(r => `${r.exam.title} ${r.exam.description ?? ''}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 40px 64px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Header */}
        <div>
          <button onClick={() => navigate('/instructor')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: tokens.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 14, fontFamily: 'inherit' }}>
            <ArrowLeft size={16} />Eğitmen Paneli
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>Tüm Sınavlar <span style={{ color: tokens.subtle, fontWeight: 600 }}>({rows.length})</span></h1>
              <p style={{ margin: '6px 0 0', color: tokens.muted, fontSize: 15 }}>Oluşturduğun tüm sınavlar. Detay için bir satıra tıkla.</p>
            </div>
            <Btn variant="primary" onClick={() => navigate('/instructor/create-exam')} icon={<Plus size={16} />} style={{ padding: '11px 18px', borderRadius: 12 }}>Yeni Sınav Oluştur</Btn>
          </div>
        </div>

        {/* Table card */}
        <div style={{ background: tokens.card, borderRadius: 16, border: `1px solid ${tokens.hairline}`, boxShadow: '0 4px 24px -4px rgba(30,58,138,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${tokens.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ClipboardList size={20} style={{ color: tokens.navy }} />
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Sınav Listesi</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: tokens.bg, border: `1px solid ${tokens.hairline}`, borderRadius: 10, minWidth: 240 }}>
              <Search size={15} style={{ color: tokens.subtle }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sınav ara…"
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, color: tokens.ink, fontFamily: 'inherit', fontSize: 13 }} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>{rows.length === 0 ? 'Henüz sınav oluşturmadın' : 'Sınav bulunamadı'}</div>
              <div style={{ fontSize: 13.5, color: tokens.subtle, marginBottom: 18 }}>{rows.length === 0 ? 'İlk sınavını oluşturarak başla.' : 'Farklı bir arama terimi dene.'}</div>
              {rows.length === 0 && <Btn variant="primary" onClick={() => navigate('/instructor/create-exam')} icon={<Plus size={15} />}>İlk Sınavı Oluştur</Btn>}
            </div>
          ) : (
            <ExamTable rows={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
