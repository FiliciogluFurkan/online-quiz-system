import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import type { Question } from '../types';

interface Answer {
  id: number;
  question: Question;
  answerText: string;
  isCorrect: boolean | null;
  pointsEarned: number | null;
}

interface ResultData {
  studentExam: {
    id: number;
    score: number;
    status: string;
    submittedAt: string;
  };
  answers: Answer[];
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
}

export default function ExamResult() {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();
  const [result, setResult] = useState<ResultData | null>(null);

  // URL'den role belirle
  const isInstructor = location.pathname.includes('/instructor/');
  const isStudent = location.pathname.includes('/student/');

  useEffect(() => {
    loadResult();
  }, [studentExamId]);

  const loadResult = async () => {
    try {
      const res = await api.get(`/results/student-exam/${studentExamId}`);
      setResult(res.data);
    } catch (error) {
      alert('Sonuç yüklenemedi');
    }
  };

  if (!result) return <div style={{ padding: 40 }}>Yükleniyor...</div>;

  const totalPoints = result.answers.reduce(
    (sum, a) => sum + (a.question.points || 0),
    0
  );

  const percentage =
    totalPoints > 0 ? (result.studentExam.score / totalPoints) * 100 : 0;

  const correct = result.correctCount;
  const wrong = result.incorrectCount;
  const empty = result.unansweredCount;
  const total = result.totalQuestions;

  return (
    <div style={page}>
      <div style={container}>
        {/* HEADER */}
        <div style={headerCard}>
          <h1 style={title}>Sınav Tamamlandı 🎉</h1>

          <p style={subtitle}>
            {new Date(result.studentExam.submittedAt).toLocaleString('tr-TR')}
          </p>

          {/* SCORE */}
          <div style={scoreRow}>
            <div style={scoreBox}>
              <div style={scoreBig}>{result.studentExam.score}</div>
              <span style={muted}>Puan</span>
            </div>

            <div style={scoreBox}>
              <div style={scoreBig}>%{percentage.toFixed(0)}</div>
              <span style={muted}>Başarı</span>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={progressWrapper}>
            <div
              style={{
                ...progressBar,
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        {/* CHART + STATS */}
        <div style={grid}>
          {/* DONUT */}
          <div style={cardCenter}>
            <DonutChart correct={correct} wrong={wrong} empty={empty} total={total} />
          </div>

          {/* STATS */}
          <div style={card}>
            <h3 style={sectionTitle}>Özet</h3>

            <Stat label="Doğru" value={correct} color="#16a34a" bg="#f0fdf4" />
            <Stat label="Yanlış" value={wrong} color="#dc2626" bg="#fef2f2" />
            <Stat label="Boş" value={empty} color="#64748b" bg="#f8fafc" />
          </div>
        </div>

        {/* ANSWERS */}
        <div style={card}>
          <h3 style={sectionTitle}>Cevaplar</h3>

          {result.answers.map((a, i) => (
            <div key={a.id} style={answerCard}>
              <div style={badgeRow}>
                <span style={badge(a.isCorrect)}>
                  {a.isCorrect === null
                    ? 'Manuel'
                    : a.isCorrect
                    ? '✓ Doğru'
                    : '✗ Yanlış'}
                </span>

                <span style={pointsBadge}>
                  {a.pointsEarned ?? 0}/{a.question.points}
                </span>
              </div>

              <p style={question}>
                {i + 1}. {a.question.questionText}
              </p>

              <div style={answerText}>
                <strong>Cevabın:</strong> {a.answerText || 'Boş'}
              </div>

              {a.isCorrect === false && (
                <div style={correctAnswer}>
                  <strong>Doğru:</strong> {a.question.correctAnswer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* BUTTON */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => {
              if (isInstructor) {
                navigate(-1); // Instructor için geri git
              } else {
                navigate('/student?refresh=' + Date.now());
              }
            }} 
            style={mainButton}
          >
            {isInstructor ? 'Geri Dön' : 'Öğrenci Paneline Dön'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= UI ================= */

function Stat({ label, value, color, bg }: any) {
  return (
    <div style={{ ...miniStat, background: bg }}>
      <b style={{ color }}>{value}</b>
      <span>{label}</span>
    </div>
  );
}

/* 🎯 DONUT CHART */
function DonutChart({ correct, wrong, empty, total }: any) {
  const c = (correct / total) * 100;
  const w = (wrong / total) * 100;
  const e = (empty / total) * 100;

  const gradient = `
    conic-gradient(
      #16a34a 0% ${c}%,
      #dc2626 ${c}% ${c + w}%,
      #cbd5f5 ${c + w}% 100%
    )
  `;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...donut, background: gradient }}>
        <div style={donutInner}>{total}</div>
      </div>
      <p style={{ marginTop: 12, color: '#64748b' }}>Toplam Soru</p>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.08), transparent 30%), #f8fafc',
  padding: '40px 20px',
};

const container = {
  maxWidth: '1000px',
  margin: '0 auto',
};

const headerCard = {
  padding: '40px',
  borderRadius: '28px',
  background: 'rgba(255,255,255,0.9)',
  border: '1px solid #e2e8f0',
  boxShadow: '0 30px 80px rgba(15,23,42,0.08)',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const title = {
  fontSize: '32px',
  fontWeight: 900,
  margin: 0,
};

const subtitle = {
  color: '#64748b',
  marginTop: '8px',
};

const scoreRow = {
  display: 'flex',
  justifyContent: 'center',
  gap: '16px',
  marginTop: '24px',
};

const scoreBox = {
  padding: '20px 30px',
  borderRadius: '20px',
  background: '#fff',
  border: '1px solid #e2e8f0',
};

const scoreBig = {
  fontSize: '40px',
  fontWeight: 900,
};

const muted = {
  color: '#64748b',
};

const progressWrapper = {
  marginTop: '24px',
  height: '10px',
  background: '#e2e8f0',
  borderRadius: '999px',
  overflow: 'hidden',
};

const progressBar = {
  height: '100%',
  background: 'linear-gradient(90deg, #6366f1, #22c55e)',
  borderRadius: '999px',
  transition: 'width 0.8s ease',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
};

const card = {
  padding: '24px',
  borderRadius: '24px',
  background: 'rgba(255,255,255,0.9)',
  border: '1px solid #e2e8f0',
  boxShadow: '0 20px 50px rgba(15,23,42,0.06)',
};

const cardCenter = {
  ...card,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const sectionTitle = {
  marginBottom: '16px',
  fontWeight: 800,
};

const miniStat = {
  padding: '14px',
  borderRadius: '14px',
  marginBottom: '10px',
  display: 'flex',
  justifyContent: 'space-between',
};

const answerCard = {
  padding: '18px',
  borderRadius: '18px',
  marginBottom: '12px',
  border: '1px solid #e2e8f0',
  background: '#fff',
};

const badgeRow = {
  display: 'flex',
  gap: '8px',
};

const badge = (c: any) => ({
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
  background:
    c === null ? '#f1f5f9' : c ? '#dcfce7' : '#fee2e2',
  color:
    c === null ? '#64748b' : c ? '#16a34a' : '#dc2626',
});

const pointsBadge = {
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
  background: '#eef2ff',
  color: '#4f46e5',
};

const question = {
  marginTop: '10px',
  fontWeight: 600,
};

const answerText = {
  marginTop: '6px',
  color: '#64748b',
};

const correctAnswer = {
  marginTop: '4px',
  color: '#16a34a',
};

const mainButton = {
  marginTop: '20px',
  padding: '14px 28px',
  borderRadius: '14px',
  border: '1px solid #c7d2fe',
  background: 'linear-gradient(135deg, #eef2ff, #fff)',
  color: '#4f46e5',
  fontWeight: 800,
  cursor: 'pointer',
};

/* DONUT */
const donut = {
  width: '140px',
  height: '140px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const donutInner = {
  width: '90px',
  height: '90px',
  borderRadius: '50%',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
};