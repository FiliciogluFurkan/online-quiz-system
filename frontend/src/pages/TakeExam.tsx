import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Exam, Question } from '../types';
import Toast from '../components/Toast';

interface ExamQuestion {
  id: number;
  question: Question;
  orderIndex: number;
}

interface Answer {
  questionId: number;
  answerText: string;
}

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [studentExamId, setStudentExamId] = useState<number | null>(null);
  const [showWarning5Min, setShowWarning5Min] = useState(false);
  const [showWarning1Min, setShowWarning1Min] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'warning' | 'critical'>('warning');

  useEffect(() => {
    loadExam();
  }, [id]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // 5 dakika uyarısı
          if (newTime === 5 * 60 && !showWarning5Min) {
            setToastMessage('⚠️ 5 dakika kaldı! Cevaplarınızı kontrol edin.');
            setToastType('warning');
            setShowWarning5Min(true);
          }
          
          // 1 dakika uyarısı
          if (newTime === 60 && !showWarning1Min) {
            setToastMessage('🚨 1 dakika kaldı! Sınav otomatik olarak teslim edilecek.');
            setToastType('critical');
            setShowWarning1Min(true);
          }
          
          // Süre bitti
          if (newTime <= 0) {
            handleSubmit();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, showWarning5Min, showWarning1Min]);

  const loadExam = async () => {
    try {
      const examRes = await api.get(`/exams/${id}`);
      setExam(examRes.data);
      
      const questionsRes = await api.get(`/exam-questions/exam/${id}`);
      setQuestions(questionsRes.data);
      
      // Backend'den kontrol et (artık Keycloak user ID ile)
      try {
        const existingExamRes = await api.get(`/student-exams/check/${id}`);
        if (existingExamRes.data && 
            ['SUBMITTED', 'GRADED'].includes(existingExamRes.data.status)) {
          alert('Bu sınavı zaten tamamladınız!');
          navigate('/student');
          return;
        }
        
        // Eğer IN_PROGRESS durumunda bir kayıt varsa onu kullan
        if (existingExamRes.data && existingExamRes.data.status === 'IN_PROGRESS') {
          setStudentExamId(existingExamRes.data.id);
          setTimeRemaining(examRes.data.duration * 60);
        } else {
          // Yeni sınav oturumu başlat
          const studentExamRes = await api.post('/student-exams', {
            exam: { id: parseInt(id!) },
            status: 'IN_PROGRESS'
          });
          setStudentExamId(studentExamRes.data.id);
          setTimeRemaining(examRes.data.duration * 60);
        }
      } catch (err) {
        // Sınav kaydı yoksa yeni oluştur
        const studentExamRes = await api.post('/student-exams', {
          exam: { id: parseInt(id!) },
          status: 'IN_PROGRESS'
        });
        setStudentExamId(studentExamRes.data.id);
        setTimeRemaining(examRes.data.duration * 60);
      }
      
      // Cevapları initialize et
      const initialAnswers = questionsRes.data.map((eq: ExamQuestion) => ({
        questionId: eq.question.id,
        answerText: ''
      }));
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Sınav yüklenirken hata oluştu!');
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => 
      prev.map(a => a.questionId === questionId ? { ...a, answerText: value } : a)
    );
  };

  const handleSubmit = async () => {
    if (!studentExamId) return;
    
    try {
      // Cevapları kaydet
      for (const answer of answers) {
        if (answer.answerText) {
          await api.post('/answers', {
            studentExam: { id: studentExamId },
            question: { id: answer.questionId },
            answerText: answer.answerText
          });
        }
      }
      
      // Sınav durumunu güncelle
      await api.put(`/student-exams/${studentExamId}`, {
        status: 'SUBMITTED'
      });
      
      // Otomatik puanlama yap
      await api.post(`/results/grade/${studentExamId}`);
      
      alert('Sınav başarıyla teslim edildi ve puanlandı!');
      navigate(`/student/result/${studentExamId}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Sınav teslim edilirken hata oluştu!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return '#dc2626'; // Kırmızı - 1 dakika
    if (timeRemaining <= 5 * 60) return '#ea580c'; // Turuncu - 5 dakika
    return '#16a34a'; // Yeşil - Normal
  };

  if (!exam || questions.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Yükleniyor...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.question.id);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{exam.title}</h1>
              <p style={{ margin: 0, color: '#666' }}>Soru {currentQuestionIndex + 1} / {questions.length}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: getTimerColor(),
                fontFamily: 'monospace',
                transition: 'color 0.3s ease'
              }}>
                {formatTime(timeRemaining)}
              </div>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Kalan Süre</p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '6px 12px', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold' }}>
              {currentQuestion.question.type === 'MULTIPLE_CHOICE' ? 'Çoktan Seçmeli' : 
               currentQuestion.question.type === 'TRUE_FALSE' ? 'Doğru/Yanlış' : 'Kısa Cevap'}
            </span>
            <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '6px 12px', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold' }}>
              {currentQuestion.question.points} Puan
            </span>
          </div>

          <h2 style={{ fontSize: '20px', marginBottom: '20px', lineHeight: '1.6' }}>
            {currentQuestion.question.questionText}
          </h2>

          {currentQuestion.question.type === 'MULTIPLE_CHOICE' && currentQuestion.question.options && (
            <div style={{ marginBottom: '20px' }}>
              {currentQuestion.question.options.split('\n').map((option, idx) => (
                <label 
                  key={idx} 
                  style={{ 
                    display: 'block', 
                    padding: '15px', 
                    marginBottom: '10px', 
                    border: '2px solid #e0e0e0', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: currentAnswer?.answerText === option.charAt(0) ? '#e3f2fd' : 'white',
                    borderColor: currentAnswer?.answerText === option.charAt(0) ? '#1976d2' : '#e0e0e0'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.question.id}`}
                    value={option.charAt(0)}
                    checked={currentAnswer?.answerText === option.charAt(0)}
                    onChange={(e) => handleAnswerChange(currentQuestion.question.id, e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {currentQuestion.question.type === 'TRUE_FALSE' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                padding: '15px', 
                marginBottom: '10px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                cursor: 'pointer',
                background: currentAnswer?.answerText === 'true' ? '#e3f2fd' : 'white',
                borderColor: currentAnswer?.answerText === 'true' ? '#1976d2' : '#e0e0e0'
              }}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.question.id}`}
                  value="true"
                  checked={currentAnswer?.answerText === 'true'}
                  onChange={(e) => handleAnswerChange(currentQuestion.question.id, e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                Doğru
              </label>
              <label style={{ 
                display: 'block', 
                padding: '15px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                cursor: 'pointer',
                background: currentAnswer?.answerText === 'false' ? '#e3f2fd' : 'white',
                borderColor: currentAnswer?.answerText === 'false' ? '#1976d2' : '#e0e0e0'
              }}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.question.id}`}
                  value="false"
                  checked={currentAnswer?.answerText === 'false'}
                  onChange={(e) => handleAnswerChange(currentQuestion.question.id, e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                Yanlış
              </label>
            </div>
          )}

          {currentQuestion.question.type === 'SHORT_ANSWER' && (
            <textarea
              value={currentAnswer?.answerText || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.question.id, e.target.value)}
              placeholder="Cevabınızı buraya yazın..."
              rows={6}
              style={{ 
                width: '100%', 
                padding: '15px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            style={{
              padding: '12px 24px',
              background: currentQuestionIndex === 0 ? '#ccc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ← Önceki
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                style={{
                  padding: '12px 24px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Sınavı Bitir
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                style={{
                  padding: '12px 24px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Sonraki →
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Soru Navigasyonu</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {questions.map((q, idx) => {
              const hasAnswer = answers.find(a => a.questionId === q.question.id)?.answerText;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    background: idx === currentQuestionIndex ? '#007bff' : hasAnswer ? '#28a745' : '#e0e0e0',
                    color: idx === currentQuestionIndex || hasAnswer ? 'white' : '#666'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <p style={{ margin: '15px 0 0 0', fontSize: '13px', color: '#666' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#28a745', borderRadius: '3px', marginRight: '5px' }}></span>
            Cevaplanmış
            <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#e0e0e0', borderRadius: '3px', marginLeft: '15px', marginRight: '5px' }}></span>
            Cevaplanmamış
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
