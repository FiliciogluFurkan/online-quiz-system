import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import type { Question } from '../types';

interface Answer {
  id: number;
  question: Question;
  answerText: string;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  feedback?: string | null;
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
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [savedAnswers, setSavedAnswers] = useState<Set<number>>(new Set());

  const loadResult = useCallback(async () => {
    if (!studentExamId) return;
    try {
      const res = await api.get(`/results/student-exam/${studentExamId}`);
      setResult(res.data);
      const initialGrades: Record<number, number> = {};
      const initialFeedbacks: Record<number, string> = {};
      res.data.answers.forEach((answer: Answer) => {
        if (answer.pointsEarned !== null) {
          initialGrades[answer.id] = answer.pointsEarned;
        }
        if (answer.feedback) {
          initialFeedbacks[answer.id] = answer.feedback;
        }
      });
      setGrades(initialGrades);
      setFeedbacks(initialFeedbacks);
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

  const handleFeedbackChange = (answerId: number, value: string) => {
    setFeedbacks((prev) => ({ ...prev, [answerId]: value }));
    setSavedAnswers((prev) => {
      const next = new Set(prev);
      next.delete(answerId);
      return next;
    });
  };

  const handleSaveGrade = async (answerId: number, maxPoints: number) => {
    const pointsEarned = grades[answerId];
    if (pointsEarned === undefined || pointsEarned < 0 || pointsEarned > maxPoints) {
      alert(`Puan 0 ile ${maxPoints} arasında olmalıdır!`);
      return;
    }
    try {
      const feedback = feedbacks[answerId]?.trim() || null;
      await api.put(`/results/answer/${answerId}/grade`, { pointsEarned, feedback });
      setSavedAnswers((prev) => new Set(prev).add(answerId));
      await loadResult();
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Puan kaydedilirken hata oluştu!');
    }
  };

  const manualAnswers = useMemo(() => {
    if (!result) return [];
    return result.answers.filter((a) => a.question.type === 'SHORT_ANSWER');
  }, [result]);

  const totalPossiblePoints = useMemo(() => {
    if (!result) return 0;
    return result.answers.reduce((sum, a) => sum + (a.question.points || 0), 0);
  }, [result]);

  return {
    result, grades, feedbacks, savedAnswers,
    handleGradeChange, handleFeedbackChange, handleSaveGrade,
    manualAnswers, totalPossiblePoints,
  };
}
