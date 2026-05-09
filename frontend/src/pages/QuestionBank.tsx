import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  FilePlus2,
  FileQuestion,
  Layers,
  Plus,
  Save,
  Sparkles,
  X,
  BookOpen,
  Upload
} from 'lucide-react';
import api from '../api/axios';
import type { Question } from '../types';

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background:
      'radial-gradient(circle at 10% 8%, rgba(99,102,241,0.10), transparent 26%), radial-gradient(circle at 88% 12%, rgba(14,165,233,0.10), transparent 24%), #f8fafc',
    color: '#0f172a',
    padding: '32px',
    boxSizing: 'border-box',
  },
  container: { maxWidth: '1100px', margin: '0 auto' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '22px'
  },
  titleWrap: {},
  eyebrow: {
    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px',
    background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', fontSize: '13px', fontWeight: 900, marginBottom: '10px'
  },
  title: { margin: 0, fontSize: '40px', lineHeight: 1.05, letterSpacing: '-0.04em', fontWeight: 950 },
  subtitle: { margin: '10px 0 0', color: '#64748b', fontSize: '15px' },
  actions: { display: 'flex', gap: '10px' },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '14px', padding: '12px 16px',
    border: '1px solid #bfdbfe', background: 'linear-gradient(135deg, #eff6ff, #ffffff)', color: '#1d4ed8', fontWeight: 900,
    boxShadow: '0 14px 30px rgba(37,99,235,0.10)', cursor: 'pointer'
  },
  ghostBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '14px', padding: '12px 14px',
    border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: 900, cursor: 'pointer'
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '18px' },
  card: {
    background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '26px',
    boxShadow: '0 22px 60px rgba(15,23,42,0.06)'
  },
  formCard: { padding: '22px' },
  sectionTitle: { margin: '0 0 14px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' },
  field: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', color: '#334155', fontWeight: 800 },
  input: {
    width: '100%', boxSizing: 'border-box', border: '1px solid #dbe3ef', borderRadius: '14px', padding: '12px 12px',
    background: '#fff', fontSize: '14px'
  },
  textarea: {
    width: '100%', boxSizing: 'border-box', border: '1px solid #dbe3ef', borderRadius: '14px', padding: '12px 12px',
    background: '#fff', fontSize: '14px', minHeight: '110px'
  },
  gridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
  listHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
    padding: '18px 20px', borderBottom: '1px solid #eef2f7', background: 'linear-gradient(135deg,#f8fafc,#eef2ff)'
  },
  listBody: { padding: '16px' },
  qGrid: { display: 'grid', gap: '12px' },
  qCard: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '16px',
    boxShadow: '0 10px 26px rgba(15,23,42,0.04)'
  },
  tags: { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' },
  tag: { padding: '6px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 900 },
  qText: { margin: '6px 0', fontWeight: 800 },
  options: { marginTop: '8px', background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: '12px', padding: '10px', fontSize: '12px' },
  answer: { marginTop: '8px', color: '#15803d', fontSize: '13px', fontWeight: 800 },
  empty: { padding: '36px', textAlign: 'center', color: '#64748b' },
  side: { padding: '18px' },
  sideStat: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
};

export default function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    type: 'MULTIPLE_CHOICE' as const,
    options: '',
    correctAnswer: '',
    points: 1,
    categoryId: null as number | null,
  });

  useEffect(() => { 
    loadQuestions(); 
    loadCategories();
  }, []);
  
  const loadQuestions = () => api.get('/questions').then(res => setQuestions(res.data));
  
  const loadCategories = () => api.get('/categories').then(res => setCategories(res.data));

  const stats = useMemo(() => ({
    total: questions.length,
    mc: questions.filter(q => q.type === 'MULTIPLE_CHOICE').length,
    tf: questions.filter(q => q.type === 'TRUE_FALSE').length,
  }), [questions]);
  
  const filteredQuestions = useMemo(() => {
    if (!selectedCategory) return questions;
    return questions.filter(q => q.category?.id === parseInt(selectedCategory));
  }, [questions, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        category: formData.categoryId ? { id: formData.categoryId } : null,
      };
      await api.post('/questions', payload);
      alert('Soru eklendi!');
      setShowForm(false);
      setFormData({ questionText: '', type: 'MULTIPLE_CHOICE', options: '', correctAnswer: '', points: 1, categoryId: null });
      loadQuestions();
    } catch (error) {
      alert('Hata oluştu!');
      console.error(error);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <div style={styles.eyebrow}><Sparkles size={14}/> Soru yönetimi</div>
            <h1 style={styles.title}>Soru Bankası</h1>
            <p style={styles.subtitle}>Sorularını tek yerden oluştur, düzenle ve sınavlarda kullan.</p>
          </div>
          <div style={styles.actions}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button onClick={() => navigate('/instructor/bulk-import')} style={styles.ghostBtn}>
              <Upload size={16}/> Toplu İçe Aktar
            </button>
            <button onClick={() => setShowForm(v => !v)} style={styles.primaryBtn}>
              <Plus size={16}/> {showForm ? 'Formu Kapat' : 'Yeni Soru'}
            </button>
            <button onClick={() => navigate('/instructor')} style={styles.ghostBtn}>
              <ArrowLeft size={16}/> Geri
            </button>
          </div>
        </div>

        <div style={styles.layout}>
          <section style={{ ...styles.card, ...styles.formCard }}>
            <h2 style={styles.sectionTitle}><FilePlus2 size={18} color="#4f46e5"/> Yeni Soru</h2>

            {showForm ? (
              <form onSubmit={handleSubmit}>
                <div style={styles.field}>
                  <label style={styles.label}>Soru Tipi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    style={styles.input}
                  >
                    <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
                    <option value="TRUE_FALSE">Doğru/Yanlış</option>
                    <option value="SHORT_ANSWER">Kısa Cevap</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Soru Metni</label>
                  <textarea
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    required
                    style={styles.textarea}
                  />
                </div>
                
                <div style={styles.field}>
                  <label style={styles.label}>Kategori (Opsiyonel)</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                    style={styles.input}
                  >
                    <option value="">Kategori Seçiniz</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.type === 'MULTIPLE_CHOICE' && (
                  <div style={styles.field}>
                    <label style={styles.label}>Seçenekler</label>
                    <textarea
                      value={formData.options}
                      onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                      placeholder="Her satıra bir seçenek"
                      style={styles.textarea}
                    />
                  </div>
                )}

                <div style={styles.gridTwo}>
                  <div style={styles.field}>
                    <label style={styles.label}>Doğru Cevap</label>
                    <input
                      type="text"
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      required
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Puan</label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                      min="1"
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button type="button" onClick={() => setShowForm(false)} style={styles.ghostBtn}>
                    <X size={16}/> İptal
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    <Save size={16}/> Kaydet
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.empty}>
                <CircleHelp size={28}/>
                <p>Yeni soru eklemek için "Yeni Soru" butonuna tıkla.</p>
              </div>
            )}
          </section>

          <aside style={{ ...styles.card, ...styles.side }}>
            <div style={styles.sideStat}><Layers size={18}/> Toplam: <strong>{stats.total}</strong></div>
            <div style={styles.sideStat}><FileQuestion size={18}/> Çoktan Seçmeli: <strong>{stats.mc}</strong></div>
            <div style={styles.sideStat}><CheckCircle2 size={18}/> Doğru/Yanlış: <strong>{stats.tf}</strong></div>
          </aside>
        </div>

        <section style={{ ...styles.card, marginTop: '18px' }}>
          <div style={styles.listHeader}>
            <h2 style={styles.sectionTitle}><BookOpen size={18} color="#2563eb"/> Sorular ({questions.length})</h2>
          </div>

          <div style={styles.listBody}>
            {questions.length === 0 ? (
              <div style={styles.empty}>Henüz soru yok.</div>
            ) : (
              <div style={styles.qGrid}>
                {filteredQuestions.map((q, i) => (
                  <div key={q.id} style={styles.qCard}>
                    <div style={styles.tags}>
                      <span style={{ ...styles.tag, background: '#eff6ff', color: '#1d4ed8' }}>{q.type}</span>
                      <span style={{ ...styles.tag, background: '#f5f3ff', color: '#6d28d9' }}>{q.points} puan</span>
                    </div>
                    <p style={styles.qText}>{i + 1}. {q.questionText}</p>
                    {q.options && <pre style={styles.options}>{q.options}</pre>}
                    <p style={styles.answer}>✓ {q.correctAnswer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
