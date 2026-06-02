import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Upload, X, Search } from 'lucide-react';
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

function typeLabel(type: string): string {
  if (type === 'MULTIPLE_CHOICE') return 'Çoktan Seçmeli';
  if (type === 'TRUE_FALSE') return 'Doğru / Yanlış';
  return 'Kısa Cevap';
}

export default function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER',
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
    sa: questions.filter(q => q.type === 'SHORT_ANSWER').length,
  }), [questions]);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      const matchesCategory = !selectedCategory || q.category?.id === parseInt(selectedCategory);
      const matchesSearch = q.questionText.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [questions, selectedCategory, search]);

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
      setFormData({
        questionText: '', type: 'MULTIPLE_CHOICE', options: '',
        correctAnswer: '', points: 1, categoryId: null,
      });
      loadQuestions();
    } catch (error) {
      alert('Hata oluştu!');
      console.error(error);
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
          <Btn variant="primary" onClick={() => setShowForm(v => !v)}
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
          <SectionHeader kicker="Yeni soru" title="Soru oluştur" />

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Soru Tipi</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
                    <option value="TRUE_FALSE">Doğru / Yanlış</option>
                    <option value="SHORT_ANSWER">Kısa Cevap</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select
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
                  <label style={labelStyle}>Seçenekler</label>
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
                    Doğru Cevap
                    {formData.type === 'MULTIPLE_CHOICE' && (
                      <span style={{ fontFamily: tokens.sans, color: tokens.subtle, marginLeft: 6, textTransform: 'none' }}>(A, B, C, D)</span>
                    )}
                  </label>
                  <input
                    type="text" required
                    value={formData.correctAnswer}
                    onChange={e => setFormData({ ...formData, correctAnswer: e.target.value.toUpperCase() })}
                    placeholder={formData.type === 'MULTIPLE_CHOICE' ? 'A' : ''}
                    style={{ ...inputStyle, fontFamily: tokens.mono }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Puan</label>
                  <input
                    type="number" min={1} required
                    value={formData.points}
                    onChange={e => setFormData({ ...formData, points: parseInt(e.target.value || '1') })}
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
              <Btn type="button" onClick={() => setShowForm(false)} icon={<X size={14} />}>İptal</Btn>
              <Btn type="submit" variant="primary" icon={<Save size={14} />}>Kaydet</Btn>
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
                    ✓ Doğru cevap: {q.correctAnswer}
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
