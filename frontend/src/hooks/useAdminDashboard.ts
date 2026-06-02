import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import type { Exam, Question } from '../types';

interface Stats {
  totalExams: number;
  totalQuestions: number;
  totalStudentExams: number;
  completedExams: number;
  activeUsers?: number;
  totalUsers?: number;
}

export interface RoleCounts {
  STUDENT: number;
  INSTRUCTOR: number;
  ADMIN: number;
  total: number;
}

interface StudentExam {
  id: number;
  exam: Exam;
  keycloakUserId: string;
  status: string;
  score: number;
  startedAt: string;
  submittedAt: string;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [roleCounts, setRoleCounts] = useState<RoleCounts | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [studentExams, setStudentExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, examsRes, questionsRes, studentExamsRes, rolesRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/exams'),
        api.get('/admin/questions'),
        api.get('/admin/student-exams'),
        api.get('/admin/users/role-counts'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (examsRes.status === 'fulfilled') setExams(examsRes.value.data ?? []);
      if (questionsRes.status === 'fulfilled') setQuestions(questionsRes.value.data);
      if (studentExamsRes.status === 'fulfilled') setStudentExams(studentExamsRes.value.data);
      if (rolesRes.status === 'fulfilled') setRoleCounts(rolesRes.value.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      alert('Veri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteExam = async (id: number) => {
    if (!confirm('Bu sınavı silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/admin/exams/${id}`);
      alert('Sınav silindi!');
      loadData();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Sınav silinirken hata oluştu!');
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/admin/questions/${id}`);
      alert('Soru silindi!');
      loadData();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Soru silinirken hata oluştu!');
    }
  };

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => exam.title?.toLowerCase().includes(search.toLowerCase()));
  }, [exams, search]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) =>
      question.questionText?.toLowerCase().includes(search.toLowerCase())
    );
  }, [questions, search]);

  const filteredStudentExams = useMemo(() => {
    return studentExams.filter((item) =>
      `${item.exam?.title || ''} ${item.keycloakUserId || ''} ${item.status || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [studentExams, search]);

  return {
    stats,
    roleCounts,
    exams,
    questions,
    studentExams,
    loading,
    search,
    setSearch,
    handleDeleteExam,
    handleDeleteQuestion,
    filteredExams,
    filteredQuestions,
    filteredStudentExams,
  };
}
