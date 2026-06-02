import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Pencil, Trash2, X, FolderOpen } from 'lucide-react';
import { useCategoryManagement } from '../hooks/useCategoryManagement';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, Stat, SectionHeader, Btn,
} from '../components/academic-ui';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: '#fff',
  border: `1px solid ${tokens.hairline}`,
  borderRadius: 10,
  fontFamily: 'inherit',
  fontSize: 14,
  color: tokens.ink,
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block',
  fontFamily: tokens.mono,
  fontSize: 10.5,
  color: tokens.subtle,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  fontWeight: 600,
  marginBottom: 8,
};

export default function CategoryManagement() {
  const navigate = useNavigate();
  const {
    categories, showForm, setShowForm, editingCategory,
    formData, setFormData,
    handleSubmit, handleEdit, handleDelete, handleCancel,
  } = useCategoryManagement();

  return (
    <PageShell>
      <Crumbs items={['Eğitmen', 'Kategoriler']} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', gap: 24, marginBottom: 32, flexWrap: 'wrap' as const,
      }}>
        <div>
          <Kicker>Organizasyon</Kicker>
          <div style={{ marginTop: 8 }}>
            <HeroTitle>Kategoriler</HeroTitle>
          </div>
          <p style={{
            margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
            fontSize: 15.5, lineHeight: 1.6,
          }}>
            Soruları konularına göre düzenle. Her soru bir kategoriye atanabilir,
            böylece sınav oluştururken filtreleme yapabilirsin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate('/instructor')}>Geri</Btn>
          <Btn variant="primary" onClick={() => setShowForm(true)} icon={<Plus size={14} />}>
            Yeni Kategori
          </Btn>
        </div>
      </div>

      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32,
      }}>
        <Stat label="Toplam Kategori" value={String(categories.length).padStart(2, '0')} accent={tokens.indigo} />
        <Stat label="Açıklamalı" value={String(categories.filter(c => c.description?.trim()).length).padStart(2, '0')}
          sub="açıklama bulunan" />
      </section>

      {showForm && (
        <section style={{
          marginBottom: 32, padding: 24,
          background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
        }}>
          <SectionHeader
            kicker={editingCategory ? 'Düzenle' : 'Yeni'}
            title={editingCategory ? 'Kategori güncelle' : 'Kategori oluştur'}
          />

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle} htmlFor="cat-name">Kategori Adı *</label>
                <input
                  id="cat-name" required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn. Matematik · Lineer Cebir"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="cat-desc">Açıklama</label>
                <textarea
                  id="cat-desc" rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Bu kategoriye eklenecek soruların kapsamını anlat…"
                  style={{ ...inputStyle, resize: 'vertical' as const }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              marginTop: 20, paddingTop: 16,
              borderTop: `1px solid ${tokens.hairlineSoft}`,
            }}>
              <Btn type="button" onClick={handleCancel} icon={<X size={14} />}>İptal</Btn>
              <Btn type="submit" variant="primary" icon={<Save size={14} />}>
                {editingCategory ? 'Güncelle' : 'Kaydet'}
              </Btn>
            </div>
          </form>
        </section>
      )}

      <section>
        <SectionHeader
          kicker="Liste"
          title="Tüm kategoriler"
          count={categories.length}
        />

        {categories.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center' as const,
            background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: tokens.indigoSoft, color: tokens.indigo,
              display: 'grid', placeItems: 'center',
              margin: '0 auto 16px',
            }}>
              <FolderOpen size={24} />
            </div>
            <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted, marginBottom: 8 }}>
              Henüz kategori yok
            </div>
            <div style={{ fontSize: 13.5, color: tokens.subtle, marginBottom: 18 }}>
              İlk kategorini oluşturarak sorularını gruplandırmaya başla.
            </div>
            <Btn variant="primary" onClick={() => setShowForm(true)} icon={<Plus size={14} />}>
              Yeni Kategori
            </Btn>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {categories.map((category, idx) => (
              <article key={category.id} style={{
                padding: 20, background: '#fff',
                border: `1px solid ${tokens.hairline}`, borderRadius: 12,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <header style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{
                    fontFamily: tokens.mono, fontSize: 11, color: tokens.subtle,
                    letterSpacing: '0.06em',
                  }}>#{String(idx + 1).padStart(2, '0')}</span>
                  <h3 style={{
                    margin: 0, fontFamily: tokens.serif,
                    fontSize: 20, fontWeight: 400, color: tokens.ink,
                    letterSpacing: '-0.01em', flex: 1,
                  }}>{category.name}</h3>
                </header>

                <p style={{
                  margin: 0, fontSize: 13, color: tokens.muted,
                  lineHeight: 1.55, flex: 1,
                }}>{category.description || 'Açıklama eklenmemiş.'}</p>

                <div style={{
                  display: 'flex', gap: 8, marginTop: 'auto',
                  paddingTop: 12, borderTop: `1px solid ${tokens.hairlineSoft}`,
                }}>
                  <Btn onClick={() => handleEdit(category)} icon={<Pencil size={13} />}
                    style={{ flex: 1, justifyContent: 'center', fontSize: 12.5 }}>
                    Düzenle
                  </Btn>
                  <Btn variant="danger" onClick={() => handleDelete(category.id!)}
                    icon={<Trash2 size={13} />}
                    style={{ flex: 1, justifyContent: 'center', fontSize: 12.5 }}>
                    Sil
                  </Btn>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
