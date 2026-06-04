import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, X, Save, Search, Pencil, Trash2, Sigma, List, Scale, PenLine, SquarePen, Info, FolderInput, CheckSquare, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import { uploadQuestionImage, resolveImageUrl } from '../api/images';
import type { Question } from '../types';
import { tokens, Btn } from '../components/academic-ui';

interface Category { id: number; name: string; }

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13.5, fontWeight: 600, color: tokens.text, marginBottom: 8,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', background: tokens.card,
  border: `1px solid ${tokens.hairline}`, borderRadius: 10,
  fontFamily: 'inherit', fontSize: 14, color: tokens.ink, outline: 'none', boxSizing: 'border-box',
};

const initialFormState = {
  questionText: '',
  type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER',
  options: '',
  correctAnswer: '',
  points: 1,
  categoryId: null as number | null,
  imageUrl: '' as string,
};

function typeBadge(type: string): { label: string; bg: string; fg: string } {
  if (type === 'MULTIPLE_CHOICE') return { label: 'ÇS', bg: '#c9e6ff', fg: '#004c6e' };
  if (type === 'TRUE_FALSE') return { label: 'D/Y', bg: '#e2dfff', fg: '#3323cc' };
  return { label: 'KC', bg: '#d3e4fe', fg: '#444651' };
}

function formatAnswer(q: Question): string {
  const a = (q.correctAnswer ?? '').trim();
  if (!a) return '—';
  if (q.type === 'TRUE_FALSE') {
    const low = a.toLowerCase();
    if (['true', 'doğru', 'd', '1', 'evet'].includes(low)) return 'Doğru';
    if (['false', 'yanlış', 'y', '0', 'hayır'].includes(low)) return 'Yanlış';
  }
  return a;
}

export default function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadCategories();
  }, []);

  // Doğru cevabı da içeren eğitmen listesi (correctAnswer entity'de WRITE_ONLY)
  const loadQuestions = () => api.get('/questions/manage').then(res => setQuestions(res.data));
  const loadCategories = () => api.get('/categories').then(res => setCategories(res.data));

  const stats = useMemo(() => ({
    total: questions.length,
    mc: questions.filter(q => q.type === 'MULTIPLE_CHOICE').length,
    tf: questions.filter(q => q.type === 'TRUE_FALSE').length,
    sa: questions.filter(q => q.type === 'SHORT_ANSWER').length,
  }), [questions]);

  const filtered = useMemo(() => questions.filter(q => {
    const matchesCategory = !selectedCategory || q.category?.id === parseInt(selectedCategory);
    const matchesSearch = q.questionText.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [questions, selectedCategory, search]);

  const resetForm = () => { setFormData(initialFormState); setEditingId(null); };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setFormData({
      questionText: q.questionText,
      type: q.type as typeof formData.type,
      options: q.options || '',
      correctAnswer: q.correctAnswer || '',
      points: q.points ?? 1,
      categoryId: q.category?.id ?? null,
      imageUrl: q.imageUrl || '',
    });
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

  // ─── Toplu seçim ───
  const toggleOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const allFilteredSelected = filtered.length > 0 && filtered.every(q => selectedIds.has(q.id));
  const toggleAll = () => {
    setSelectedIds(prev => {
      if (filtered.every(q => prev.has(q.id))) {
        const next = new Set(prev);
        filtered.forEach(q => next.delete(q.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach(q => next.add(q.id));
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`${ids.length} soruyu silmek istediğinden emin misin? Bu işlem geri alınamaz.`)) return;
    setBulkBusy(true);
    try {
      const res = await api.post('/questions/bulk-delete', { questionIds: ids });
      const { deleted, failed } = res.data as { deleted: number; failed: number[] };
      clearSelection();
      await loadQuestions();
      if (failed?.length) {
        alert(`${deleted} soru silindi. ${failed.length} soru silinemedi (bir sınavda kullanılıyor olabilir).`);
      }
    } catch (error) {
      alert('Toplu silme sırasında hata oluştu.');
      console.error(error);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkAssignCategory = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!bulkCategoryId) { alert('Önce eklenecek kategoriyi seç.'); return; }
    setBulkBusy(true);
    try {
      const res = await api.put('/questions/bulk-category', { questionIds: ids, categoryId: parseInt(bulkCategoryId) });
      const { updated } = res.data as { updated: number };
      clearSelection();
      setBulkCategoryId('');
      await loadQuestions();
      alert(`${updated} soru seçilen kategoriye eklendi.`);
    } catch (error) {
      alert('Kategoriye ekleme sırasında hata oluştu.');
      console.error(error);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleImagePick = async (file: File | undefined) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadQuestionImage(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      alert('Görsel yüklenemedi. (En fazla 5 MB, yalnızca görsel dosyaları)');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) { alert('Lütfen bir kategori seç. Kategori zorunlu.'); return; }
    if (formData.type === 'MULTIPLE_CHOICE' && !formData.options.trim()) { alert('Çoktan seçmeli sorular için seçenekler zorunludur.'); return; }
    if (!formData.correctAnswer.trim()) { alert('Doğru cevap boş bırakılamaz.'); return; }
    setSaving(true);
    try {
      const payload = { ...formData, category: { id: formData.categoryId } };
      if (editingId) await api.put(`/questions/${editingId}`, payload);
      else await api.post('/questions', payload);
      resetForm();
      loadQuestions();
    } catch (error) {
      alert('Hata oluştu! Form veriniz korundu, tekrar deneyebilirsiniz.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { icon: <Sigma size={18} />, color: tokens.navy, label: 'Toplam', value: stats.total, big: true },
    { icon: <List size={18} />, color: '#0369a1', label: 'Çoktan Seçmeli', value: stats.mc, big: false },
    { icon: <Scale size={18} />, color: tokens.indigo, label: 'Doğru / Yanlış', value: stats.tf, big: false },
    { icon: <PenLine size={18} />, color: tokens.muted, label: 'Kısa Cevap', value: stats.sa, big: false },
  ];

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 40px 64px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>Soru Bankası</h1>
            <p style={{ margin: '6px 0 0', color: tokens.muted, fontSize: 15 }}>Sorularını tek yerden oluştur, kategorize et ve sınavlarda kullan.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn onClick={() => navigate('/instructor/bulk-import')} icon={<Upload size={16} />}>Toplu İçe Aktar</Btn>
            <Btn variant="primary" onClick={resetForm} icon={<Plus size={16} />}>Yeni Soru</Btn>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 20, boxShadow: '0 4px 20px rgba(30,58,138,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: tokens.muted, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: s.color }}>{s.icon}</span>{s.label}
              </div>
              <div style={{ fontSize: s.big ? 40 : 30, fontWeight: 800, color: tokens.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(30,58,138,0.06)' }}>
          <div style={{ height: 6, background: tokens.navy }} />
          <div style={{ padding: 28 }}>
            <h3 style={{ margin: '0 0 22px', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <SquarePen size={20} style={{ color: tokens.navy }} />{editingId ? 'Soruyu Güncelle' : 'Yeni Soru Oluştur'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Row: type / category / points */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Soru Tipi</label>
                  <select value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as typeof formData.type, correctAnswer: '', options: '' })}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
                    <option value="TRUE_FALSE">Doğru / Yanlış</option>
                    <option value="SHORT_ANSWER">Kısa Cevap</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Kategori <span style={{ color: tokens.bad }}>*</span></label>
                  <select required value={formData.categoryId || ''}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Kategori seçiniz</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Puan</label>
                  <input type="number" min={1} required
                    value={formData.points === 0 ? '' : formData.points}
                    onChange={e => { const v = e.target.value; setFormData({ ...formData, points: v === '' ? 0 : parseInt(v) }); }}
                    style={inputStyle} />
                </div>
              </div>

              {/* Question text */}
              <div>
                <label style={labelStyle}>Soru Metni</label>
                <textarea required rows={3} value={formData.questionText}
                  onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Soru kökünü buraya girin..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Options + correct answer */}
              <div style={{ display: 'grid', gridTemplateColumns: formData.type === 'MULTIPLE_CHOICE' ? '1fr 1fr' : '1fr', gap: 20 }}>
                {formData.type === 'MULTIPLE_CHOICE' && (
                  <div>
                    <label style={labelStyle}>Seçenekler <span style={{ color: tokens.subtle, fontWeight: 400, fontSize: 12 }}>(Her satıra bir seçenek yazın)</span></label>
                    <textarea rows={4} value={formData.options}
                      onChange={e => setFormData({ ...formData, options: e.target.value })}
                      placeholder={"A) Seçenek 1\nB) Seçenek 2\nC) Seçenek 3\nD) Seçenek 4"}
                      style={{ ...inputStyle, fontFamily: tokens.mono, fontSize: 13, resize: 'vertical' }} />
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Doğru Cevap</label>
                  {formData.type === 'TRUE_FALSE' ? (
                    <select required value={formData.correctAnswer}
                      onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                      style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Seçiniz</option>
                      <option value="true">Doğru</option>
                      <option value="false">Yanlış</option>
                    </select>
                  ) : (
                    <input type="text" required value={formData.correctAnswer}
                      onChange={e => setFormData({ ...formData, correctAnswer: formData.type === 'MULTIPLE_CHOICE' ? e.target.value.toUpperCase() : e.target.value })}
                      placeholder="Örn: A veya Doğru Seçenek Metni"
                      style={inputStyle} />
                  )}
                  <div style={{ marginTop: 14, padding: 14, background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Info size={18} style={{ color: '#0369a1', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: 13, color: tokens.muted, lineHeight: 1.5 }}>Doğru cevabı seçeneklerde yazdığınız metinle birebir eşleşecek şekilde veya harf olarak belirtebilirsiniz.</p>
                  </div>
                </div>
              </div>

              {/* Görsel (opsiyonel) */}
              <div>
                <label style={labelStyle}>Soru Görseli <span style={{ color: tokens.subtle, fontWeight: 400, fontSize: 12 }}>(opsiyonel)</span></label>
                {formData.imageUrl ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <img src={resolveImageUrl(formData.imageUrl)} alt="Soru görseli"
                      style={{ maxWidth: 220, maxHeight: 150, borderRadius: 10, border: `1px solid ${tokens.hairline}`, objectFit: 'contain', background: tokens.ivory }} />
                    <Btn type="button" variant="danger" onClick={() => setFormData({ ...formData, imageUrl: '' })} icon={<X size={14} />}>Görseli Kaldır</Btn>
                  </div>
                ) : (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: `1px dashed ${tokens.hairline}`, background: tokens.ivory, color: tokens.muted, fontSize: 13.5, fontWeight: 600, cursor: uploadingImage ? 'wait' : 'pointer' }}>
                    <ImageIcon size={16} />{uploadingImage ? 'Yükleniyor…' : 'Görsel Seç'}
                    <input type="file" accept="image/*" disabled={uploadingImage}
                      onChange={e => { handleImagePick(e.target.files?.[0]); e.target.value = ''; }}
                      style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: `1px solid ${tokens.hairline}` }}>
                <Btn type="button" onClick={resetForm} icon={<X size={15} />}>İptal</Btn>
                <Btn type="submit" variant="primary" disabled={saving} icon={<Save size={15} />}>{saving ? 'Kaydediliyor…' : (editingId ? 'Güncelle' : 'Kaydet')}</Btn>
              </div>
            </form>
          </div>
        </div>

        {/* Question list */}
        <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(30,58,138,0.06)' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${tokens.hairline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Soru Listesi</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: tokens.bg, border: `1px solid ${tokens.hairline}`, borderRadius: 10, minWidth: 220 }}>
                <Search size={15} style={{ color: tokens.subtle }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Soru ara…"
                  style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, color: tokens.ink, fontFamily: 'inherit', fontSize: 13 }} />
              </div>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                style={{ padding: '8px 12px', background: tokens.bg, border: `1px solid ${tokens.hairline}`, borderRadius: 10, color: tokens.ink, fontFamily: 'inherit', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                <option value="">Kategori Filtrele</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Toplu işlem çubuğu */}
          {selectedIds.size > 0 && (
            <div style={{ padding: '12px 24px', background: '#eef2ff', borderBottom: `1px solid ${tokens.hairline}`, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: tokens.navy }}>
                <CheckSquare size={16} />{selectedIds.size} soru seçildi
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
                <select value={bulkCategoryId} onChange={e => setBulkCategoryId(e.target.value)}
                  style={{ padding: '8px 12px', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 10, color: tokens.ink, fontFamily: 'inherit', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                  <option value="">Kategori seç…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Btn onClick={handleBulkAssignCategory} disabled={bulkBusy} icon={<FolderInput size={15} />}>Kategoriye Ekle</Btn>
                <Btn variant="danger" onClick={handleBulkDelete} disabled={bulkBusy} icon={<Trash2 size={15} />}>Seçilenleri Sil</Btn>
                <Btn type="button" onClick={clearSelection} icon={<X size={15} />}>Seçimi Temizle</Btn>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>{questions.length === 0 ? 'Henüz soru yok' : 'Sonuç bulunamadı'}</div>
              <div style={{ fontSize: 13.5, color: tokens.subtle }}>{questions.length === 0 ? 'İlk soruyu yukarıdaki formla ekleyebilirsin.' : 'Farklı bir arama veya kategori dene.'}</div>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: tokens.ivory, borderBottom: `1px solid ${tokens.hairline}` }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px 12px 24px', width: 40 }}>
                        <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} title="Tümünü seç"
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: tokens.navy }} />
                      </th>
                      {['#', 'Tip', 'Puan', 'Soru Önizleme', 'Kategori', 'Doğru Cevap', 'İşlemler'].map((h, i, arr) => (
                        <th key={h} style={{ textAlign: i === arr.length - 1 ? 'right' : 'left', padding: '12px 24px', fontSize: 11.5, fontWeight: 700, color: tokens.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((q, idx) => {
                      const b = typeBadge(q.type);
                      const checked = selectedIds.has(q.id);
                      return (
                        <tr key={q.id} style={{ borderBottom: `1px solid ${tokens.hairlineSoft}`, background: checked ? '#f4f7ff' : 'transparent' }}
                          onMouseEnter={e => (e.currentTarget.style.background = checked ? '#eef2ff' : tokens.ivory)}
                          onMouseLeave={e => (e.currentTarget.style.background = checked ? '#f4f7ff' : 'transparent')}>
                          <td style={{ padding: '14px 16px 14px 24px' }}>
                            <input type="checkbox" checked={checked} onChange={() => toggleOne(q.id)}
                              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: tokens.navy }} />
                          </td>
                          <td style={{ padding: '14px 24px', color: tokens.subtle, fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: '14px 24px' }}>
                            <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 5, background: b.bg, color: b.fg, fontSize: 11, fontWeight: 800, letterSpacing: '0.04em' }}>{b.label}</span>
                          </td>
                          <td style={{ padding: '14px 24px', fontSize: 13.5, color: tokens.text }}>{q.points} Puan</td>
                          <td style={{ padding: '14px 24px', fontSize: 13.5, color: tokens.text, maxWidth: 320 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {q.imageUrl && (
                                <img src={resolveImageUrl(q.imageUrl)} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover', border: `1px solid ${tokens.hairline}`, flexShrink: 0 }} />
                              )}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.questionText}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 24px' }}>
                            {q.category?.name ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, background: '#e5eeff', color: tokens.navy, fontSize: 12, fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.category.name}</span>
                            ) : (
                              <span style={{ fontSize: 13, color: tokens.subtle }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 24px', fontSize: 13.5, fontWeight: 600, color: tokens.navy, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatAnswer(q)}</td>
                          <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button type="button" onClick={() => startEdit(q)} title="Düzenle" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: tokens.muted, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Pencil size={17} /></button>
                              <button type="button" onClick={() => handleDelete(q)} title="Sil" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: tokens.bad, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={17} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '16px 24px', borderTop: `1px solid ${tokens.hairline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 13, color: tokens.subtle }}>1-{filtered.length} arası gösteriliyor (Toplam {questions.length})</p>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: tokens.navy, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700 }}>1</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
