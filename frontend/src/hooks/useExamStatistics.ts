import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

interface Question {
  id: number;
  questionText: string;
  points: number;
  type: string;
  correctAnswer?: string;
  options?: string;
}

export interface QuestionStat {
  question: Question;
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  successRate: number;
  discriminationIndex?: number;
  difficultyIndex?: number;
  optionDistribution?: Record<string, number>;
}

export interface Statistics {
  totalParticipants: number;
  completedCount: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  questionStatistics: QuestionStat[];
}

export function useExamStatistics(examId: string | undefined) {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [examTitle, setExamTitle] = useState('');

  const loadStatistics = useCallback(async () => {
    if (!examId) return;
    try {
      const examRes = await api.get(`/exams/${examId}`);
      setExamTitle(examRes.data.title);
      const statsRes = await api.get(`/results/exam/${examId}/statistics`);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      alert('İstatistikler yüklenirken hata oluştu!');
    }
  }, [examId]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const sortedQuestions = useMemo(() => {
    if (!stats) return [];
    return [...stats.questionStatistics].sort((a, b) => a.successRate - b.successRate);
  }, [stats]);

  return { stats, examTitle, sortedQuestions };
}
