import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { useCreateExam } from '../hooks/useCreateExam';
import { tokens } from '../components/academic-ui';

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13.5, fontWeight: 600, color: tokens.text, marginBottom: 8,
};
const inputStyle: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 16px', background: tokens.card,
  border: `1px solid ${tokens.hairline}`, borderRadius: 10,
  fontFamily: 'inherit', fontSize: 14, color: tokens.ink, outline: 'none', boxSizing: 'border-box',
};

export default function CreateExam() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { formData, setFormData, computedEndTime, handleSubmit, saving, loading, isEditMode } = useCreateExam(navigate, id);
  const [randomize, setRandomize] = useState(false); // UI hazır; backend desteği sonra bağlanacak

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: tokens.bg, color: tokens.muted }}>Yükleniyor…</div>;
  }

  const backTo = isEditMode ? `/instructor/exam/${id}` : '/instructor';
  const pool = formData.questionPoolEnabled;
  // Yayındaki bir sınav düzenlenirken geçmiş başlangıç korunabilir; diğer hallerde
  // tarih seçicide "şimdi"den öncesi seçilemez.
  const minStart = (isEditMode && formData.published) ? undefined : (() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => navigate(backTo)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: tokens.indigo, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 16, fontFamily: 'inherit' }}>
            <ArrowLeft size={16} />{isEditMode ? 'Sınav Detayına Dön' : 'Eğitmen Paneli'}
          </button>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>{isEditMode ? 'Sınavı Düzenle' : 'Yeni Sınav Oluştur'}</h1>
          <p style={{ margin: '6px 0 0', color: tokens.muted, fontSize: 15 }}>Yeni bir sınav tanımlayın ve ayarlarını yapılandırın.</p>
          {isEditMode && formData.published && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, fontSize: 13.5, color: '#9a3412', lineHeight: 1.5 }}>
              Bu sınav <strong>yayında</strong>. Öğrenciler katıldıysa süre ve takvim değişiklikleri yok sayılır; yalnızca başlık ve açıklama güncellenir.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Section 1: Sınav Bilgileri */}
          <section style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 24, boxShadow: '0 4px 24px -4px rgba(30,58,138,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 16, borderBottom: `1px solid ${tokens.hairline}` }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: '#e5eeff', color: tokens.navy, display: 'grid', placeItems: 'center' }}><FileText size={20} /></span>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Sınav Bilgileri</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Sınav Başlığı</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Örn: Ara Sınav - Matematik 101" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Açıklama</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Sınav hakkında genel bilgiler..." style={{ ...inputStyle, height: 'auto', padding: '12px 16px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Süre (dakika)</label>
                  <input type="number" min={1} required value={formData.duration === 0 ? '' : formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value === '' ? 0 : parseInt(e.target.value) })} placeholder="60" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Başlangıç Tarihi</label>
                  <input type="datetime-local" required min={minStart} value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Bitiş Tarihi <span style={{ color: tokens.subtle, fontWeight: 400, fontSize: 12 }}>(otomatik)</span></label>
                  <input type="datetime-local" value={computedEndTime} disabled style={{ ...inputStyle, background: tokens.ivory, color: tokens.muted }} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Soru Ayarları */}
          <section style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 24, boxShadow: '0 4px 24px -4px rgba(30,58,138,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 16, borderBottom: `1px solid ${tokens.hairline}` }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: '#e5eeff', color: tokens.navy, display: 'grid', placeItems: 'center' }}><SlidersHorizontal size={20} /></span>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Soru Ayarları</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Radio cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { val: false, title: 'Tüm Sorular', desc: 'Eklenen tüm sorular sorulur.' },
                  { val: true, title: 'Soru Havuzu', desc: 'Havuzdan rastgele seçilir.' },
                ].map(opt => {
                  const sel = pool === opt.val;
                  return (
                    <div key={opt.title} onClick={() => setFormData({ ...formData, questionPoolEnabled: opt.val })}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16, borderRadius: 10, border: sel ? `2px solid ${tokens.navy}` : `1px solid ${tokens.hairline}`, background: sel ? '#f0f3ff' : tokens.card }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink, marginBottom: 3 }}>{opt.title}</div>
                        <div style={{ fontSize: 13, color: tokens.muted }}>{opt.desc}</div>
                      </div>
                      <CheckCircle2 size={22} style={{ color: sel ? tokens.navy : tokens.hairline, flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>

              {/* Pool settings */}
              {pool && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, padding: 16, background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 10 }}>
                  <div>
                    <label style={labelStyle}>Havuz Boyutu</label>
                    <input type="number" min={1} value={formData.poolSize === 0 ? '' : formData.poolSize}
                      onChange={e => setFormData({ ...formData, poolSize: e.target.value === '' ? 0 : parseInt(e.target.value) })} placeholder="100" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Öğrenci Başına Soru Sayısı</label>
                    <input type="number" min={1} max={formData.poolSize || undefined} value={formData.questionsPerStudent === 0 ? '' : formData.questionsPerStudent}
                      onChange={e => setFormData({ ...formData, questionsPerStudent: e.target.value === '' ? 0 : parseInt(e.target.value) })} placeholder="20" style={inputStyle} />
                    {formData.questionsPerStudent > formData.poolSize && formData.poolSize > 0 && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: tokens.bad }}>Havuz boyutundan büyük olamaz.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Randomize toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="button" role="switch" aria-checked={randomize} onClick={() => setRandomize(!randomize)}
                  style={{ position: 'relative', width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', background: randomize ? tokens.navy : tokens.hairline, transition: 'background .2s', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: 2, left: randomize ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, color: tokens.ink }}>Soruları rastgele sırala</span>
              </div>
            </div>
          </section>

          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, paddingTop: 4 }}>
            <button type="button" onClick={() => navigate(backTo)} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'transparent', color: tokens.muted, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
            {!isEditMode && (
              <button type="submit" disabled={saving} style={{ padding: '12px 24px', borderRadius: 10, border: `1px solid ${tokens.hairline}`, background: tokens.card, color: tokens.indigo, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Taslak Kaydet</button>
            )}
            <button type="submit" disabled={saving} style={{ padding: '12px 30px', borderRadius: 10, border: 'none', background: tokens.navy, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Kaydediliyor…' : isEditMode ? 'Değişiklikleri Kaydet' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
