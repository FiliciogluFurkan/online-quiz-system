import { Plus, Save, Pencil, Trash2, X, FolderOpen, FileText, SquarePen, Tag } from 'lucide-react';
import { useCategoryManagement } from '../hooks/useCategoryManagement';
import { tokens, Btn } from '../components/academic-ui';

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
