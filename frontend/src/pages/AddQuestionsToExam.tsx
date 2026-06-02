import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Search } from 'lucide-react';
import api from '../api/axios';
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

export default function AddQuestionsToExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [exam, setExam] = useState<ExamPoolInfo | null>(null);

  useEffect(() => {
    api.get('/questions').then(res => setQuestions(res.data));
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
      return matchesText && matchesType;
    }),
    [questions, search, typeFilter]);

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
    </PageShell>
  );
}
