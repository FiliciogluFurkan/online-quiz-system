import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Exam } from '../types';

export default function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    api.get('/exams').then(res => setExams(res.data));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Öğrenci Paneli</h1>
      <h2>Mevcut Sınavlar</h2>
      <div>
        {exams.map(exam => (
          <div key={exam.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{exam.title}</h3>
            <p>{exam.description}</p>
            <p>Süre: {exam.duration} dakika</p>
          </div>
        ))}
      </div>
    </div>
  );
}
