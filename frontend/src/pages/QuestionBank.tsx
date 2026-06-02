import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Upload, X, Search, Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import type { Question } from '../types';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, Stat, SectionHeader, Btn, CodeTag,
} from '../components/academic-ui';

interface Category {
  id: number;
  name: string;
}

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

const initialFormState = {
  questionText: '',
  type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER',
  options: '',
  correctAnswer: '',
  points: 1,
  categoryId: null as number | null,
};

function typeLabel(type: string): string {
  if (type === 'MULTIPLE_CHOICE') return 'Çoktan Seçmeli';
  if (type === 'TRUE_FALSE') return 'Doğru / Yanlış';
  return 'Kısa Cevap';
}

function tfDisplay(value: string): string {
  const v = (value || '').trim().toLowerCase();
  if (v === 'true' || v === 'doğru' || v === 'd') return 'Doğru';
  if (v === 'false' || v === 'yanlış' || v === 'y') return 'Yanlış';
  return value;
}

export default function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

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
    sa: questions.filter(q => q.type === 'SHORT_ANSWER').length,
  }), [questions]);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      const matchesCategory = !selectedCategory || q.category?.id === parseInt(selectedCategory);
      const matchesSearch = q.questionText.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [questions, selectedCategory, search]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const startCreate = () => {
    if (showForm) {
      setShowForm(false);
      resetForm();
    } else {
      resetForm();
      setShowForm(true);
    }
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setFormData({
      questionText: q.questionText,
      type: q.type as typeof formData.type,
      options: q.options || '',
      correctAnswer: q.correctAnswer || '',
      points: q.points ?? 1,
      categoryId: q.category?.id ?? null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (q: Question) => {
    if (!window.confirm(`"${q.questionText}" sorusunu silmek istediğinden emin misin?`)) return;
    try {
      await api.delete(`/questions/${q.id}`);
      loadQuestions();
    } catch (error) {
      alert('Soru silinemedi. Bu soru bir sınavda kullanılıyor olabilir.');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert('Lütfen bir kategori seç. Kategori zorunlu.');
      return;
    }
    if (formData.type === 'MULTIPLE_CHOICE' && !formData.options.trim()) {
      alert('Çoktan seçmeli sorular için seçenekler zorunludur.');
      return;
    }
    if (!formData.correctAnswer.trim()) {
      alert('Doğru cevap boş bırakılamaz.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        category: { id: formData.categoryId },
      };
      if (editingId) {
        await api.put(`/questions/${editingId}`, payload);
      } else {
        await api.post('/questions', payload);
      }
      setShowForm(false);
      resetForm();
      loadQuestions();
    } catch (error) {
      alert('Hata oluştu! Form veriniz korundu, tekrar deneyebilirsiniz.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <Crumbs items={['Eğitmen', 'Soru bankası']} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', gap: 24, marginBottom: 32, flexWrap: 'wrap' as const,
      }}>
        <div>
          <Kicker>Soru yönetimi</Kicker>
          <div style={{ marginTop: 8 }}>
            <HeroTitle>Soru Bankası</HeroTitle>
          </div>
          <p style={{
            margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
            fontSize: 15.5, lineHeight: 1.6,
          }}>
            Sorularını tek yerden oluştur, kategorize et ve sınavlarda kullan.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate('/instructor')}>Geri</Btn>
          <Btn onClick={() => navigate('/instructor/bulk-import')} icon={<Upload size={14} />}>
            Toplu İçe Aktar
          </Btn>
          <Btn variant="primary" onClick={startCreate}
            icon={showForm ? <X size={14} /> : <Plus size={14} />}>
            {showForm ? 'Formu Kapat' : 'Yeni Soru'}
          </Btn>
        </div>
      </div>

      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32,
      }}>
        <Stat label="Toplam" value={String(stats.total).padStart(2, '0')} accent={tokens.indigo} />
        <Stat label="Çoktan Seçmeli" value={String(stats.mc).padStart(2, '0')} />
        <Stat label="Doğru / Yanlış" value={String(stats.tf).padStart(2, '0')} />
        <Stat label="Kısa Cevap" value={String(stats.sa).padStart(2, '0')} />
      </section>

      {showForm && (
        <section style={{
          marginBottom: 32, padding: 24,
          background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
        }}>
          <SectionHeader
            kicker={editingId ? 'Soru düzenle' : 'Yeni soru'}
            title={editingId ? 'Soruyu güncelle' : 'Soru oluştur'}
          />

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Soru Tipi</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({
                      ...formData,
                      type: e.target.value as typeof formData.type,
                      correctAnswer: '',
                      options: '',
                    })}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
                    <option value="TRUE_FALSE">Doğru / Yanlış</option>
                    <option value="SHORT_ANSWER">Kısa Cevap</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Kategori *</label>
                  <select
                    required
                    value={formData.categoryId || ''}
                    onChange={e => setFormData({
                      ...formData,
                      categoryId: e.target.value ? parseInt(e.target.value) : null,
                    })}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Kategori seçiniz</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Soru Metni *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.questionText}
                  onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' as const }}
                />
              </div>

              {formData.type === 'MULTIPLE_CHOICE' && (
                <div>
                  <label style={labelStyle}>Seçenekler *</label>
                  <textarea
                    rows={4}
                    value={formData.options}
                    onChange={e => setFormData({ ...formData, options: e.target.value })}
                    placeholder={"A) İstanbul\nB) Ankara\nC) İzmir\nD) Bursa"}
                    style={{ ...inputStyle, fontFamily: tokens.mono, fontSize: 13, resize: 'vertical' as const }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>
                    Doğru Cevap *
                    {formData.type === 'MULTIPLE_CHOICE' && (
                      <span style={{ fontFamily: tokens.sans, color: tokens.subtle, marginLeft: 6, textTransform: 'none' }}>(A, B, C, D)</span>
                    )}
                  </label>
                  {formData.type === 'TRUE_FALSE' ? (
                    <select
                      required
                      value={formData.correctAnswer}
                      onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                      style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Seçiniz</option>
                      <option value="true">Doğru</option>
                      <option value="false">Yanlış</option>
                    </select>
                  ) : (
                    <input
                      type="text" required
                      value={formData.correctAnswer}
                      onChange={e => setFormData({
                        ...formData,
                        correctAnswer: formData.type === 'MULTIPLE_CHOICE'
                          ? e.target.value.toUpperCase()
                          : e.target.value,
                      })}
                      placeholder={formData.type === 'MULTIPLE_CHOICE' ? 'A' : ''}
                      style={{ ...inputStyle, fontFamily: tokens.mono }}
                    />
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Puan *</label>
                  <input
                    type="number" min={1} required
                    value={formData.points === 0 ? '' : formData.points}
                    onChange={e => {
                      const v = e.target.value;
                      setFormData({ ...formData, points: v === '' ? 0 : parseInt(v) });
                    }}
                    style={{ ...inputStyle, fontFamily: tokens.mono }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              marginTop: 20, paddingTop: 16,
              borderTop: `1px solid ${tokens.hairlineSoft}`,
            }}>
              <Btn type="button" onClick={() => { setShowForm(false); resetForm(); }} icon={<X size={14} />}>İptal</Btn>
              <Btn type="submit" variant="primary" disabled={saving} icon={<Save size={14} />}>
                {saving ? 'Kaydediliyor…' : (editingId ? 'Güncelle' : 'Kaydet')}
              </Btn>
            </div>
          </form>
        </section>
      )}

      <section>
        <SectionHeader
          kicker="Tüm sorular"
          title="Soru listesi"
          count={filtered.length}
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: '#fff',
                border: `1px solid ${tokens.hairline}`, borderRadius: 10,
                color: tokens.subtle, minWidth: 240,
              }}>
                <Search size={15} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Soru ara…"
                  style={{
                    border: 'none', outline: 'none', background: 'transparent',
                    flex: 1, color: tokens.ink, fontFamily: 'inherit', fontSize: 13,
                  }}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{
                  padding: '8px 12px', background: '#fff',
                  border: `1px solid ${tokens.hairline}`, borderRadius: 10,
                  color: tokens.ink, fontFamily: 'inherit', fontSize: 13,
                  outline: 'none', cursor: 'pointer',
                }}>
                <option value="">Tüm kategoriler</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          }
        />

        {filtered.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center' as const,
            background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          }}>
            <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted, marginBottom: 8 }}>
              {questions.length === 0 ? 'Henüz soru yok' : 'Sonuç bulunamadı'}
            </div>
            <div style={{ fontSize: 13.5, color: tokens.subtle }}>
              {questions.length === 0
                ? 'İlk soruyu "Yeni Soru" ile ekleyebilirsin.'
                : 'Farklı bir arama veya kategori deneyin.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map((q, idx) => (
              <article key={q.id} style={{
                padding: 20, background: '#fff',
                border: `1px solid ${tokens.hairline}`, borderRadius: 12,
                position: 'relative' as const,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: tokens.ink, color: '#fff',
                    display: 'grid', placeItems: 'center',
                    fontFamily: tokens.mono, fontSize: 12, fontWeight: 600,
                  }}>{String(idx + 1).padStart(2, '0')}</span>
                  <CodeTag tone="slate">{typeLabel(q.type)}</CodeTag>
                  <span style={{ fontSize: 12, color: tokens.subtle }}>{q.points} puan</span>
                  {q.category && (
                    <>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cfcfd6' }} />
                      <span style={{ fontSize: 12, color: tokens.subtle }}>{q.category.name}</span>
                    </>
                  )}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => startEdit(q)}
                      title="Düzenle"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 10px', fontSize: 12,
                        background: '#fff', border: `1px solid ${tokens.hairline}`,
                        borderRadius: 8, color: tokens.ink, cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                      <Pencil size={13} /> Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(q)}
                      title="Sil"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 10px', fontSize: 12,
                        background: '#fff', border: '1px solid #fecaca',
                        borderRadius: 8, color: tokens.bad, cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                      <Trash2 size={13} /> Sil
                    </button>
                  </div>
                </div>

                <p style={{
                  margin: 0, fontFamily: tokens.serif,
                  fontSize: 17, lineHeight: 1.45, color: tokens.ink, fontWeight: 400,
                }}>{q.questionText}</p>

                {q.options && (
                  <pre style={{
                    margin: '12px 0 0', padding: '10px 12px',
                    background: '#fafafb', border: `1px solid ${tokens.hairlineSoft}`,
                    borderRadius: 8, fontFamily: tokens.mono,
                    fontSize: 13, color: tokens.text,
                    whiteSpace: 'pre-wrap' as const, lineHeight: 1.6,
                  }}>{q.options}</pre>
                )}

                {q.correctAnswer && (
                  <div style={{
                    marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 6,
                    background: '#ecfdf5', border: '1px solid #bbf7d0',
                    color: tokens.good, fontSize: 12.5,
                    fontFamily: tokens.mono, fontWeight: 600,
                  }}>
                    ✓ Doğru cevap: {q.type === 'TRUE_FALSE' ? tfDisplay(q.correctAnswer) : q.correctAnswer}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
