import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Exam } from '../types';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    api.get('/exams').then(res => setExams(res.data));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Eğitmen Paneli</h1>
      <button 
        onClick={() => navigate('/instructor/create-exam')}
        style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
      >
        Yeni Sınav Oluştur
      </button>
      <h2>Sınavlarım</h2>
      <div>
        {exams.map(exam => (
          <div key={exam.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{exam.title}</h3>
            <p>{exam.description}</p>
            <p>Durum: {exam.published ? 'Yayında' : 'Taslak'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
