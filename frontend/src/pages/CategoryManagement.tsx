import { Plus, Save, Pencil, Trash2, X, FolderOpen, FileText, SquarePen, Tag, FolderInput, Inbox } from 'lucide-react';
import { useCategoryManagement } from '../hooks/useCategoryManagement';
import { tokens, Btn } from '../components/academic-ui';

function qTypeBadge(type: string): { label: string; bg: string; fg: string } {
  if (type === 'MULTIPLE_CHOICE') return { label: 'ÇS', bg: '#c9e6ff', fg: '#004c6e' };
  if (type === 'TRUE_FALSE') return { label: 'D/Y', bg: '#e2dfff', fg: '#3323cc' };
  return { label: 'KC', bg: '#d3e4fe', fg: '#444651' };
}

function formatAns(type: string, correctAnswer?: string): string {
  const a = (correctAnswer ?? '').trim();
  if (!a) return '—';
  if (type === 'TRUE_FALSE') {
    const low = a.toLowerCase();
    if (['true', 'doğru', 'd', '1', 'evet'].includes(low)) return 'Doğru';
    if (['false', 'yanlış', 'y', '0', 'hayır'].includes(low)) return 'Yanlış';
  }
  return a;
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13.5, fontWeight: 600, color: tokens.text, marginBottom: 8,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', background: tokens.card,
  border: `1px solid ${tokens.hairline}`, borderRadius: 10,
  fontFamily: 'inherit', fontSize: 14, color: tokens.ink, outline: 'none', boxSizing: 'border-box',
};

export default function CategoryManagement() {
  const {
    categories, showForm, setShowForm, editingCategory,
    formData, setFormData,
    handleSubmit, handleEdit, handleDelete, handleCancel,
    uncategorized, categoryQuestions, selectedQuestionIds, toggleQuestion, assignSelectedToCategory, assigning,
  } = useCategoryManagement();

  const described = categories.filter(c => c.description?.trim()).length;

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 40px 64px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>Kategoriler</h1>
            <p style={{ margin: '6px 0 0', color: tokens.muted, fontSize: 15 }}>Soruları konularına göre düzenle; sınav oluştururken kategoriye göre filtrele.</p>
          </div>
          <Btn variant="primary" onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Yeni Kategori</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { icon: <FolderOpen size={18} />, color: tokens.navy, label: 'Toplam Kategori', value: categories.length },
            { icon: <FileText size={18} />, color: tokens.indigo, label: 'Açıklamalı', value: described },
          ].map(s => (
            <div key={s.label} style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 20, boxShadow: '0 4px 20px rgba(30,58,138,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: tokens.muted, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: s.color }}>{s.icon}</span>{s.label}
              </div>
              <div style={{ fontSize: 34, fontWeight: 800, color: tokens.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form card */}
        {showForm && (
          <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(30,58,138,0.06)' }}>
            <div style={{ height: 6, background: tokens.navy }} />
            <div style={{ padding: 28 }}>
              <h3 style={{ margin: '0 0 22px', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                <SquarePen size={20} style={{ color: tokens.navy }} />{editingCategory ? 'Kategoriyi Güncelle' : 'Yeni Kategori Oluştur'}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Kategori Adı <span style={{ color: tokens.bad }}>*</span></label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Örn: Veri Yapıları" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Açıklama</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Bu kategoriye eklenecek soruların kapsamını anlat…" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: `1px solid ${tokens.hairline}` }}>
                  <Btn type="button" onClick={handleCancel} icon={<X size={15} />}>İptal</Btn>
                  <Btn type="submit" variant="primary" icon={<Save size={15} />}>{editingCategory ? 'Güncelle' : 'Kaydet'}</Btn>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bu kategoriye ait sorular (yalnızca düzenleme modunda) */}
        {showForm && editingCategory && (
          <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(30,58,138,0.06)' }}>
            <div style={{ height: 6, background: tokens.navy }} />
            <div style={{ padding: '20px 24px', borderBottom: categoryQuestions.length > 0 ? `1px solid ${tokens.hairline}` : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Tag size={18} style={{ color: tokens.navy }} />
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>
                "{editingCategory.name}" kategorisindeki sorular <span style={{ color: tokens.subtle, fontWeight: 600 }}>({categoryQuestions.length})</span>
              </h3>
            </div>
            {categoryQuestions.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: tokens.subtle, fontSize: 13.5 }}>Bu kategoride henüz soru yok. Aşağıdan kategorisiz soruları ekleyebilirsin.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: tokens.ivory, borderBottom: `1px solid ${tokens.hairline}` }}>
                      {['#', 'Tip', 'Puan', 'Soru Önizleme', 'Doğru Cevap'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 24px', fontSize: 11.5, fontWeight: 700, color: tokens.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categoryQuestions.map((q, idx) => {
                      const b = qTypeBadge(q.type);
                      return (
                        <tr key={q.id} style={{ borderBottom: `1px solid ${tokens.hairlineSoft}` }}>
                          <td style={{ padding: '14px 24px', color: tokens.subtle, fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: '14px 24px' }}>
                            <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 5, background: b.bg, color: b.fg, fontSize: 11, fontWeight: 800, letterSpacing: '0.04em' }}>{b.label}</span>
                          </td>
                          <td style={{ padding: '14px 24px', fontSize: 13.5, color: tokens.text }}>{q.points} Puan</td>
                          <td style={{ padding: '14px 24px', fontSize: 13.5, color: tokens.text, maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.questionText}</td>
                          <td style={{ padding: '14px 24px', fontSize: 13.5, fontWeight: 600, color: tokens.navy, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatAns(q.type, q.correctAnswer)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Kategoriye soru ekleme (yalnızca düzenleme modunda) */}
        {showForm && editingCategory && (
          <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(30,58,138,0.06)' }}>
            <div style={{ height: 6, background: tokens.indigo }} />
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FolderInput size={20} style={{ color: tokens.indigo }} />"{editingCategory.name}" kategorisine soru ekle
                </h3>
                <Btn variant="primary" onClick={assignSelectedToCategory} disabled={assigning || selectedQuestionIds.size === 0} icon={<Plus size={15} />}>
                  {assigning ? 'Ekleniyor…' : `Seçilenleri Ekle (${selectedQuestionIds.size})`}
                </Btn>
              </div>
              <p style={{ margin: '0 0 18px', fontSize: 13.5, color: tokens.muted }}>Aşağıda yalnızca <strong>henüz hiçbir kategoriye atanmamış</strong> sorular listelenir.</p>

              {uncategorized.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', background: tokens.ivory, border: `1px dashed ${tokens.hairline}`, borderRadius: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: tokens.card, color: tokens.subtle, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                    <Inbox size={22} />
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>Kategorisiz soru yok</div>
                  <div style={{ fontSize: 13, color: tokens.subtle }}>Tüm sorular bir kategoriye atanmış durumda.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
                  {uncategorized.map(q => {
                    const b = qTypeBadge(q.type);
                    const checked = selectedQuestionIds.has(q.id);
                    return (
                      <label key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${checked ? tokens.indigo : tokens.hairline}`, background: checked ? '#eef2ff' : tokens.card }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleQuestion(q.id)}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: tokens.indigo, flexShrink: 0 }} />
                        <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 5, background: b.bg, color: b.fg, fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', flexShrink: 0 }}>{b.label}</span>
                        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: tokens.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.questionText}</span>
                        <span style={{ fontSize: 12.5, color: tokens.subtle, fontWeight: 600, flexShrink: 0 }}>{q.points} Puan</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* List */}
        <div>
          <h2 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 700 }}>
            Tüm Kategoriler <span style={{ color: tokens.subtle, fontWeight: 600 }}>({categories.length})</span>
          </h2>

          {categories.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: tokens.card, border: `1px dashed #cdd5e5`, borderRadius: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: tokens.indigoSoft, color: tokens.indigo, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                <FolderOpen size={24} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>Henüz kategori yok</div>
              <div style={{ fontSize: 13.5, color: tokens.subtle, marginBottom: 18 }}>İlk kategorini oluşturarak sorularını gruplandırmaya başla.</div>
              <Btn variant="primary" onClick={() => setShowForm(true)} icon={<Plus size={15} />}>Yeni Kategori</Btn>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {categories.map(category => (
                <div key={category.id} style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 4px 20px rgba(30,58,138,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, background: '#e5eeff', color: tokens.navy, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Tag size={18} /></span>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: tokens.ink }}>{category.name}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, color: tokens.muted, lineHeight: 1.55, flex: 1 }}>{category.description || 'Açıklama eklenmemiş.'}</p>
                  <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: `1px solid ${tokens.hairlineSoft}` }}>
                    <Btn onClick={() => handleEdit(category)} icon={<Pencil size={14} />} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>Düzenle</Btn>
                    <Btn variant="danger" onClick={() => handleDelete(category.id!)} icon={<Trash2 size={14} />} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>Sil</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
