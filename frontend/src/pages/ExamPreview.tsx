import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Clock, BookOpen, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import type { Exam, Question } from '../types';

interface ExamQuestion {
  id: number;
  question: Question;
  orderIndex: number;
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8f9fa',
    padding: '20px',
    fontFamily: 'Inter, system-ui',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  banner: {
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    padding: '16px 24px',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '2px solid #fbbf24',
  },
  bannerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#fff',
    color: '#d97706',
    display: 'grid',
    placeItems: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 800,
    color: '#92400e',
  },
  bannerSubtitle: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#b45309',
  },
  backBtn: {
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
  },
  header: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 800,
  },
  description: {
    margin: '0 0 16px',
    color: '#64748b',
    fontSize: '15px',
    lineHeight: 1.6,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  questionCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  questionHeader: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 700,
  },
  questionText: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '16px',
    color: '#0f172a',
  },
  optionsBox: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '10px',
    marginBottom: '12px',
    border: '1px solid #e2e8f0',
    whiteSpace: 'pre-wrap' as const,
    fontSize: '15px',
    lineHeight: 1.8,
  },
  correctAnswer: {
    padding: '12px 16px',
    background: '#ecfdf5',
    borderRadius: '10px',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    fontSize: '14px',
    fontWeight: 700,
  },
  empty: {
    background: 'white',
    padding: '60px 24px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
};

export default function ExamPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  useEffect(() => {
    loadExam();
  }, [id]);

  const loadExam = async () => {
    try {
      const examRes = await api.get(`/exams/${id}`);
      setExam(examRes.data);

      const questionsRes = await api.get(`/exam-questions/exam/${id}`);
      setQuestions(questionsRes.data);
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Sınav yüklenirken hata oluştu!');
    }
  };

  if (!exam) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate(`/instructor/exam/${id}`)} style={styles.backBtn}>
          <ArrowLeft size={18} />
          Sınava Dön
        </button>

        <div style={styles.banner}>
          <div style={styles.bannerIcon}>
            <Eye size={20} />
          </div>
          <div style={styles.bannerText}>
            <h3 style={styles.bannerTitle}>Önizleme Modu</h3>
            <p style={styles.bannerSubtitle}>
              Bu sınavı öğrenci gözüyle görüyorsunuz. Cevaplar kaydedilmeyecek.
            </p>
          </div>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>{exam.title}</h1>
          <p style={styles.description}>{exam.description || 'Açıklama yok'}</p>

          <div style={styles.metaGrid}>
            <div style={styles.metaItem}>
              <Clock size={20} color="#6366f1" />
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Süre</div>
                <div style={{ fontWeight: 700 }}>{exam.duration} dakika</div>
              </div>
            </div>

            <div style={styles.metaItem}>
              <BookOpen size={20} color="#6366f1" />
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Soru Sayısı</div>
                <div style={{ fontWeight: 700 }}>{questions.length} soru</div>
              </div>
            </div>

            <div style={styles.metaItem}>
              <AlertCircle size={20} color="#6366f1" />
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Durum</div>
                <div style={{ fontWeight: 700 }}>
                  {exam.published ? 'Yayında' : 'Taslak'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {questions.length === 0 ? (
          <div style={styles.empty}>
            <BookOpen size={48} color="#94a3b8" />
            <h3 style={{ margin: '16px 0 8px', fontSize: '20px' }}>
              Henüz soru eklenmemiş
            </h3>
            <p style={{ margin: 0, color: '#64748b' }}>
              Bu sınava soru eklemek için "Soru Ekle" butonunu kullanın.
            </p>
          </div>
        ) : (
          questions.map((eq, index) => (
            <div key={eq.id} style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <span
                  style={{
                    ...styles.badge,
                    background: '#e0e7ff',
                    color: '#4f46e5',
                  }}
                >
                  {eq.question.type === 'MULTIPLE_CHOICE'
                    ? 'Çoktan Seçmeli'
                    : eq.question.type === 'TRUE_FALSE'
                    ? 'Doğru/Yanlış'
                    : 'Kısa Cevap'}
                </span>
                <span
                  style={{
                    ...styles.badge,
                    background: '#fef3c7',
                    color: '#d97706',
                  }}
                >
                  {eq.question.points} puan
                </span>
              </div>

              <div style={styles.questionText}>
                {index + 1}. {eq.question.questionText}
              </div>

              {eq.question.options && (
                <div style={styles.optionsBox}>{eq.question.options}</div>
              )}

              <div style={styles.correctAnswer}>
                ✓ Doğru Cevap: {eq.question.correctAnswer}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
