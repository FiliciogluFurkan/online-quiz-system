import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  FolderOpen,
  Layers,
  Plus,
  Save,
  Shield,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import api from '../api/axios';

interface Category {
  id?: number;
  name: string;
  description: string;
}

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background:
      'radial-gradient(circle at 10% 8%, rgba(99,102,241,0.10), transparent 26%), radial-gradient(circle at 88% 12%, rgba(14,165,233,0.10), transparent 24%), #f8fafc',
    color: '#0f172a',
    padding: '32px',
    boxSizing: 'border-box' as const,
  },
  container: {
    maxWidth: '1120px',
    margin: '0 auto',
  },
  heroCard: {
    overflow: 'hidden',
    borderRadius: '30px',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 24px 70px rgba(15,23,42,0.075)',
    marginBottom: '24px',
  },
  heroTop: {
    padding: '30px',
    background: 'linear-gradient(135deg, rgba(238,242,255,0.95), rgba(240,249,255,0.9))',
    borderBottom: '1px solid #e2e8f0',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 13px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #c7d2fe',
    color: '#4f46e5',
    fontSize: '14px',
    fontWeight: 850,
    marginBottom: '16px',
  },
  heroRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexWrap: 'wrap' as const,
  },
  title: {
    margin: 0,
    fontSize: '44px',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
    fontWeight: 950,
    color: '#0f172a',
  },
  subtitle: {
    margin: '14px 0 0',
    maxWidth: '700px',
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.7,
  },
  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 13px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 950,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#475569',
  },
  heroActions: {
    padding: '0 30px 30px',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '13px 18px',
    cursor: 'pointer',
    color: '#1d4ed8',
    fontWeight: 950,
    background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
    boxShadow: '0 16px 34px rgba(37,99,235,0.10)',
  },
  formCard: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    padding: '26px',
    marginBottom: '24px',
    boxShadow: '0 24px 70px rgba(15,23,42,0.06)',
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
  },
  formTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 950,
    color: '#0f172a',
  },
  formGrid: {
    display: 'grid',
    gap: '18px',
  },
  inputGroup: {
    display: 'grid',
    gap: '10px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 900,
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #dbe3ee',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #dbe3ee',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    minHeight: '110px',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
    marginTop: '6px',
  },
  saveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '1px solid #bbf7d0',
    borderRadius: '16px',
    padding: '13px 18px',
    cursor: 'pointer',
    color: '#15803d',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #ecfdf5, #ffffff)',
  },
  cancelButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '13px 18px',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: 900,
    background: '#ffffff',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '18px',
    flexWrap: 'wrap' as const,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
    fontSize: '24px',
    fontWeight: 950,
  },
  sectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 13px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 900,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '18px',
  },
  card: {
    position: 'relative' as const,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    padding: '22px',
    boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
  },
  cardAccent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(90deg, rgba(99,102,241,0.65), rgba(14,165,233,0.45))',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  icon: {
    width: '52px',
    height: '52px',
    borderRadius: '18px',
    background: '#eef2ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid #c7d2fe',
    flexShrink: 0,
  },
  cardTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 950,
    color: '#0f172a',
  },
  cardDescription: {
    margin: '0 0 18px',
    color: '#64748b',
    fontSize: '14px',
    lineHeight: 1.7,
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap' as const,
  },
  editButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    border: '1px solid #bfdbfe',
    borderRadius: '14px',
    padding: '10px 13px',
    cursor: 'pointer',
    color: '#1d4ed8',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
  },
  deleteButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    border: '1px solid #fecaca',
    borderRadius: '14px',
    padding: '10px 13px',
    cursor: 'pointer',
    color: '#dc2626',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #fff1f2, #ffffff)',
  },
  empty: {
    padding: '60px 24px',
    textAlign: 'center' as const,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
  },
  emptyIcon: {
    width: '78px',
    height: '78px',
    borderRadius: '26px',
    background: '#eef2ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 18px',
  },
};

export default function CategoryManagement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Category>({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Kategoriler yüklenirken hata oluştu!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Kategori adı gereklidir!');
      return;
    }

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        alert('Kategori güncellendi!');
      } else {
        await api.post('/categories', formData);
        alert('Kategori oluşturuldu!');
      }

      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      setShowForm(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategori kaydedilirken hata oluştu!');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/categories/${id}`);
      alert('Kategori silindi!');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategori silinirken hata oluştu!');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <button
          onClick={() => navigate('/instructor')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '14px',
            marginBottom: '16px',
            color: '#64748b',
          }}
        >
          <ArrowLeft size={18} />
          Geri Dön
        </button>

        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.eyebrow}>
              <Sparkles size={16} />
              İçerik organizasyonu
            </div>

            <div style={styles.heroRow}>
              <div>
                <h1 style={styles.title}>Kategori Yönetimi</h1>

                <p style={styles.subtitle}>
                  Soru kategorilerini oluşturun, düzenleyin ve içerik yapınızı merkezi şekilde yönetin.
                </p>
              </div>

              <span style={styles.topBadge}>
                <Shield size={15} />
                Yönetim paneli
              </span>
            </div>
          </div>

          {!showForm && (
            <div style={styles.heroActions}>
              <button
                onClick={() => setShowForm(true)}
                style={styles.primaryButton}
              >
                <Plus size={18} />
                Yeni Kategori
              </button>
            </div>
          )}
        </section>

        {showForm && (
          <section style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h2>

              <span style={styles.sectionBadge}>
                <Layers size={14} />
                Form alanı
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Kategori Adı *</label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Örn: Matematik, Fizik, Tarih"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Açıklama</label>

                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Kategori hakkında kısa açıklama..."
                    style={styles.textarea}
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.saveButton}>
                  <Save size={18} />
                  {editingCategory ? 'Güncelle' : 'Kaydet'}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  style={styles.cancelButton}
                >
                  <X size={18} />
                  İptal
                </button>
              </div>
            </form>
          </section>
        )}

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <FolderOpen size={24} color="#2563eb" />
            Kategoriler
          </h2>

          <span style={styles.sectionBadge}>
            <Layers size={14} />
            {categories.length} kategori
          </span>
        </div>

        {categories.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <FolderOpen size={38} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 950 }}>
              Henüz kategori yok
            </h3>

            <p
              style={{
                margin: 0,
                color: '#64748b',
                lineHeight: 1.7,
                maxWidth: '520px',
                marginInline: 'auto',
              }}
            >
              Sorularınızı organize etmek ve içerik yapınızı düzenlemek için ilk kategorinizi oluşturun.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {categories.map((category) => (
              <article key={category.id} style={styles.card}>
                <div style={styles.cardAccent} />

                <div style={styles.cardHeader}>
                  <div style={styles.icon}>
                    <FolderOpen size={24} />
                  </div>

                  <div>
                    <h3 style={styles.cardTitle}>{category.name}</h3>
                  </div>
                </div>

                <p style={styles.cardDescription}>
                  {category.description || 'Bu kategori için açıklama bulunmuyor.'}
                </p>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => handleEdit(category)}
                    style={styles.editButton}
                  >
                    <Edit2 size={15} />
                    Düzenle
                  </button>

                  <button
                    onClick={() => handleDelete(category.id!)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={15} />
                    Sil
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
