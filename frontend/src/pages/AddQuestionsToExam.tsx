import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Search, X, Save, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import { uploadQuestionImage, resolveImageUrl } from '../api/images';
import type { Question } from '../types';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, Stat, SectionHeader, Btn, CodeTag,
} from '../components/academic-ui';

function getQuestionTypeLabel(type: string): string {
  if (type === 'MULTIPLE_CHOICE') return 'Çoktan Seçmeli';
  if (type === 'TRUE_FALSE') return 'Doğru / Yanlış';
  return 'Kısa Cevap';
}

type ExamPoolInfo = {
  questionPoolEnabled?: boolean;
  poolSize?: number;
  questionsPerStudent?: number;
};

interface Category { id: number; name: string; }

type NewQuestionForm = {
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options: string;
  correctAnswer: string;
  points: number;
  categoryId: number | null;
  imageUrl: string;
};

const emptyForm: NewQuestionForm = {
  questionText: '', type: 'MULTIPLE_CHOICE', options: '', correctAnswer: '', points: 1, categoryId: null, imageUrl: '',
};

const fLabel: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: tokens.text, marginBottom: 6 };
const fInput: React.CSSProperties = {
  width: '100%', padding: '10px 13px', background: '#fff',
  border: `1px solid ${tokens.hairline}`, borderRadius: 10,
  fontFamily: 'inherit', fontSize: 14, color: tokens.ink, outline: 'none', boxSizing: 'border-box',
};

export default function AddQuestionsToExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [exam, setExam] = useState<ExamPoolInfo | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState<NewQuestionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImagePick = async (file: File | undefined) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadQuestionImage(file);
      setForm(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      alert('Görsel yüklenemedi. (En fazla 5 MB, yalnızca görsel dosyaları)');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const loadQuestions = () => api.get('/questions').then(res => setQuestions(res.data));

  useEffect(() => {
    loadQuestions();
    api.get('/categories').then(res => setCategories(res.data)).catch(() => setCategories([]));
    api.get(`/exams/${id}`).then(res => setExam(res.data));
  }, [id]);

  const toggle = (qid: number) => {
    setSelected(prev => prev.includes(qid) ? prev.filter(x => x !== qid) : [...prev, qid]);
  };

  const selectedPoints = useMemo(() =>
    questions.filter(q => selected.includes(q.id))
      .reduce((sum, q) => sum + (q.points || 0), 0),
    [questions, selected]);

  const filtered = useMemo(() =>
    questions.filter(q => {
      const matchesText = q.questionText.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'ALL' || q.type === typeFilter;
      const matchesCategory = categoryFilter === 'ALL' || q.category?.id === parseInt(categoryFilter);
      return matchesText && matchesType && matchesCategory;
    }),
    [questions, search, typeFilter, categoryFilter]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { alert('Lütfen bir kategori seç. Kategori zorunlu.'); return; }
    if (form.type === 'MULTIPLE_CHOICE' && !form.options.trim()) { alert('Çoktan seçmeli sorular için seçenekler zorunludur.'); return; }
    if (!form.correctAnswer.trim()) { alert('Doğru cevap boş bırakılamaz.'); return; }
    setSaving(true);
    try {
      const res = await api.post('/questions', { ...form, category: { id: form.categoryId } });
      const created = res.data;
      await loadQuestions();
      // Yeni soruyu otomatik seç
      if (created?.id) setSelected(prev => prev.includes(created.id) ? prev : [...prev, created.id]);
      setForm(emptyForm);
      setShowNewForm(false);
    } catch (error) {
      alert('Soru oluşturulamadı. Tekrar deneyebilirsin.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    try {
      if (exam?.questionPoolEnabled) {
        await api.post(`/question-pool/exam/${id}`, { questionIds: selected });
        alert(`${selected.length} soru havuza eklendi!`);
      } else {
        for (const qid of selected) {
          await api.post('/exam-questions', {
            exam: { id: parseInt(id!) },
            question: { id: qid },
            orderIndex: 0,
          });
        }
        alert(`${selected.length} soru eklendi!`);
      }
      navigate(`/instructor/exam/${id}`);
    } catch (error) {
      alert('Hata oluştu!');
      console.error(error);
    }
  };

  return (
    <PageShell>
      <Crumbs items={['Eğitmen', 'Sınav', 'Soru ekle']} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 24, marginBottom: 28, flexWrap: 'wrap' as const,
      }}>
        <div>
          <Kicker>Sınav içeriği</Kicker>
          <div style={{ marginTop: 8 }}>
            <HeroTitle>Soru Ekle</HeroTitle>
          </div>
          <p style={{
            margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
            fontSize: 15.5, lineHeight: 1.6,
          }}>
            {exam?.questionPoolEnabled ? (
              <>
                <strong>Soru havuzu modu:</strong> Havuz boyutu {exam.poolSize ?? '—'},
                her öğrenciye {exam.questionsPerStudent ?? '—'} soru gösterilir.
                Seçilen sorular havuza eklenir.
              </>
            ) : (
              <>Soru bankasından sınava eklemek istediğin soruları seç. Birden fazla seçim yapabilirsin.</>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate(`/instructor/exam/${id}`)}>
            Geri Dön
          </Btn>
          <Btn icon={<Plus size={14} />} onClick={() => { setForm(emptyForm); setShowNewForm(true); }}>
            Yeni Soru
          </Btn>
          <Btn
            variant="primary"
            disabled={selected.length === 0}
            onClick={handleAdd}
            icon={<Check size={14} />}
          >
            Seçilenleri Ekle ({selected.length})
          </Btn>
        </div>
      </div>

      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32,
      }}>
        <Stat label="Bankadaki Sorular" value={String(questions.length).padStart(2, '0')} />
        <Stat label="Seçilen" value={String(selected.length).padStart(2, '0')} accent={tokens.indigo} />
        <Stat label="Seçilen Puan" value={String(selectedPoints)} sub="toplam puan" />
      </section>

      <section>
        <SectionHeader
          kicker="Soru bankası"
          title="Mevcut sorular"
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
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{
                  padding: '8px 12px', background: '#fff',
                  border: `1px solid ${tokens.hairline}`, borderRadius: 10,
                  color: tokens.ink, fontFamily: 'inherit', fontSize: 13,
                  outline: 'none', cursor: 'pointer',
                }}>
                <option value="ALL">Tüm tipler</option>
                <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
                <option value="TRUE_FALSE">Doğru / Yanlış</option>
                <option value="SHORT_ANSWER">Kısa Cevap</option>
              </select>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{
                  padding: '8px 12px', background: '#fff',
                  border: `1px solid ${tokens.hairline}`, borderRadius: 10,
                  color: tokens.ink, fontFamily: 'inherit', fontSize: 13,
                  outline: 'none', cursor: 'pointer',
                }}>
                <option value="ALL">Tüm kategoriler</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              {questions.length === 0 ? 'Soru bankası boş' : 'Sonuç bulunamadı'}
            </div>
            <div style={{ fontSize: 13.5, color: tokens.subtle, marginBottom: 18 }}>
              {questions.length === 0
                ? 'Önce soru bankasına soru ekleyin.'
                : 'Farklı bir arama veya filtre deneyin.'}
            </div>
            {questions.length === 0 && (
              <Btn variant="primary" onClick={() => navigate('/instructor/questions')}
                icon={<Plus size={14} />}>Soru Bankasına Git</Btn>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map((q, idx) => {
              const isSel = selected.includes(q.id);
              return (
                <article
                  key={q.id}
                  onClick={() => toggle(q.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16,
                    padding: 18,
                    background: isSel ? tokens.indigoSoft : '#fff',
                    border: `1px solid ${isSel ? '#bfc4ee' : tokens.hairline}`,
                    borderRadius: 12, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: isSel ? tokens.indigo : '#fff',
                    color: isSel ? '#fff' : tokens.subtle,
                    border: `1px solid ${isSel ? tokens.indigo : tokens.hairline}`,
                    display: 'grid', placeItems: 'center',
                    fontFamily: tokens.mono, fontSize: 11, fontWeight: 600,
                  }}>
                    {isSel ? <Check size={14} /> : String(idx + 1).padStart(2, '0')}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                    }}>
                      <CodeTag tone="slate">{getQuestionTypeLabel(q.type)}</CodeTag>
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
                      fontSize: 16, lineHeight: 1.45, color: tokens.ink, fontWeight: 400,
                    }}>{q.questionText}</p>
                    {q.imageUrl && (
                      <img src={resolveImageUrl(q.imageUrl)} alt="" style={{ marginTop: 10, maxWidth: 260, maxHeight: 160, borderRadius: 8, border: `1px solid ${tokens.hairlineSoft}`, objectFit: 'contain', display: 'block' }} />
                    )}
                    {q.options && (
                      <pre style={{
                        margin: '10px 0 0', padding: '8px 12px',
                        background: 'rgba(0,0,0,0.02)', border: `1px solid ${tokens.hairlineSoft}`,
                        borderRadius: 8, fontFamily: tokens.mono,
                        fontSize: 12, color: tokens.text,
                        whiteSpace: 'pre-wrap' as const,
                      }}>{q.options}</pre>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Yeni soru modalı */}
      {showNewForm && (
        <div onClick={() => !saving && setShowNewForm(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(11,28,48,0.5)', display: 'grid', placeItems: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 620, maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: 16, boxShadow: '0 18px 48px rgba(11,28,48,0.22)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${tokens.hairline}` }}>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Plus size={19} style={{ color: tokens.indigo }} />Yeni Soru Oluştur
              </h3>
              <button type="button" onClick={() => setShowNewForm(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: tokens.muted, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateQuestion} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={fLabel}>Soru Tipi</label>
                  <select value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as NewQuestionForm['type'], correctAnswer: '', options: '' })}
                    style={{ ...fInput, cursor: 'pointer' }}>
                    <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
                    <option value="TRUE_FALSE">Doğru / Yanlış</option>
                    <option value="SHORT_ANSWER">Kısa Cevap</option>
                  </select>
                </div>
                <div>
                  <label style={fLabel}>Kategori <span style={{ color: tokens.bad }}>*</span></label>
                  <select required value={form.categoryId || ''}
                    onChange={e => setForm({ ...form, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                    style={{ ...fInput, cursor: 'pointer' }}>
                    <option value="">Kategori seçiniz</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={fLabel}>Puan</label>
                  <input type="number" min={1} required value={form.points === 0 ? '' : form.points}
                    onChange={e => setForm({ ...form, points: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    style={fInput} />
                </div>
              </div>

              <div>
                <label style={fLabel}>Soru Metni</label>
                <textarea required rows={3} value={form.questionText}
                  onChange={e => setForm({ ...form, questionText: e.target.value })}
                  placeholder="Soru kökünü buraya girin…"
                  style={{ ...fInput, resize: 'vertical' }} />
              </div>

              {form.type === 'MULTIPLE_CHOICE' && (
                <div>
                  <label style={fLabel}>Seçenekler <span style={{ color: tokens.subtle, fontWeight: 400, fontSize: 12 }}>(Her satıra bir seçenek)</span></label>
                  <textarea rows={4} value={form.options}
                    onChange={e => setForm({ ...form, options: e.target.value })}
                    placeholder={"A) Seçenek 1\nB) Seçenek 2\nC) Seçenek 3\nD) Seçenek 4"}
                    style={{ ...fInput, fontFamily: tokens.mono, fontSize: 13, resize: 'vertical' }} />
                </div>
              )}

              <div>
                <label style={fLabel}>Doğru Cevap</label>
                {form.type === 'TRUE_FALSE' ? (
                  <select required value={form.correctAnswer}
                    onChange={e => setForm({ ...form, correctAnswer: e.target.value })}
                    style={{ ...fInput, cursor: 'pointer' }}>
                    <option value="">Seçiniz</option>
                    <option value="true">Doğru</option>
                    <option value="false">Yanlış</option>
                  </select>
                ) : (
                  <input type="text" required value={form.correctAnswer}
                    onChange={e => setForm({ ...form, correctAnswer: form.type === 'MULTIPLE_CHOICE' ? e.target.value.toUpperCase() : e.target.value })}
                    placeholder="Örn: A veya doğru cevabın metni"
                    style={fInput} />
                )}
              </div>

              <div>
                <label style={fLabel}>Soru Görseli <span style={{ color: tokens.subtle, fontWeight: 400, fontSize: 12 }}>(opsiyonel)</span></label>
                {form.imageUrl ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <img src={resolveImageUrl(form.imageUrl)} alt="Soru görseli"
                      style={{ maxWidth: 200, maxHeight: 140, borderRadius: 10, border: `1px solid ${tokens.hairline}`, objectFit: 'contain', background: '#fafbff' }} />
                    <Btn type="button" variant="danger" onClick={() => setForm({ ...form, imageUrl: '' })} icon={<X size={14} />}>Kaldır</Btn>
                  </div>
                ) : (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: `1px dashed ${tokens.hairline}`, background: '#fafbff', color: tokens.muted, fontSize: 13.5, fontWeight: 600, cursor: uploadingImage ? 'wait' : 'pointer' }}>
                    <ImageIcon size={16} />{uploadingImage ? 'Yükleniyor…' : 'Görsel Seç'}
                    <input type="file" accept="image/*" disabled={uploadingImage}
                      onChange={e => { handleImagePick(e.target.files?.[0]); e.target.value = ''; }}
                      style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 14, borderTop: `1px solid ${tokens.hairline}` }}>
                <Btn type="button" onClick={() => setShowNewForm(false)} icon={<X size={15} />}>İptal</Btn>
                <Btn type="submit" variant="primary" disabled={saving} icon={<Save size={15} />}>{saving ? 'Kaydediliyor…' : 'Kaydet ve Seç'}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
