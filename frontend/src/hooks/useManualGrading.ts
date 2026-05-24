import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import type { Question } from '../types';

interface Answer {
  id: number;
  question: Question;
  answerText: string;
  isCorrect: boolean | null;
  pointsEarned: number | null;
}

export interface ResultData {
  studentExam: {
    id: number;
    score: number;
    status: string;
    submittedAt: string;
  };
  answers: Answer[];
}

export function useManualGrading(studentExamId: string | undefined) {
  const [result, setResult] = useState<ResultData | null>(null);
  const [grades, setGrades] = useState<Record<number, number>>({});
  const [savedAnswers, setSavedAnswers] = useState<Set<number>>(new Set());

  const loadResult = useCallback(async () => {
    if (!studentExamId) return;
    try {
      const res = await api.get(`/results/student-exam/${studentExamId}`);
      setResult(res.data);
      const initialGrades: Record<number, number> = {};
      res.data.answers.forEach((answer: Answer) => {
        if (answer.pointsEarned !== null) {
          initialGrades[answer.id] = answer.pointsEarned;
        }
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error('Error loading result:', error);
      alert('Sonuç yüklenirken hata oluştu!');
    }
  }, [studentExamId]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  const handleGradeChange = (answerId: number, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setGrades({ ...grades, [answerId]: numValue });
      setSavedAnswers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(answerId);
        return newSet;
      });
    }
  };

  const handleSaveGrade = async (answerId: number, maxPoints: number) => {
    const pointsEarned = grades[answerId];
    if (pointsEarned === undefined || pointsEarned < 0 || pointsEarned > maxPoints) {
      alert(`Puan 0 ile ${maxPoints} arasında olmalıdır!`);
      return;
    }
    try {
      await api.put(`/results/answer/${answerId}/grade`, { pointsEarned });
      setSavedAnswers((prev) => new Set(prev).add(answerId));
      await loadResult();
      alert('Puan kaydedildi!');
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Puan kaydedilirken hata oluştu!');
    }
  };

  const manualAnswers = useMemo(() => {
    if (!result) return [];
    return result.answers.filter((a) => a.question.type === 'SHORT_ANSWER' || a.isCorrect === null);
  }, [result]);

  const totalPossiblePoints = useMemo(() => {
    if (!result) return 0;
    return result.answers.reduce((sum, a) => sum + (a.question.points || 0), 0);
  }, [result]);

  return { result, grades, savedAnswers, handleGradeChange, handleSaveGrade, manualAnswers, totalPossiblePoints };
}
