import { useMemo, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import api from '../api/axios';

interface FormData {
  title: string;
  description: string;
  duration: number;
  startTime: string;
  questionPoolEnabled: boolean;
  poolSize: number;
  questionsPerStudent: number;
}

function addMinutes(datetimeLocal: string, minutes: number): string {
  if (!datetimeLocal) return '';
  const date = new Date(datetimeLocal);
  date.setMinutes(date.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDatetime(datetimeLocal: string): string {
  if (!datetimeLocal) return '';
  const date = new Date(datetimeLocal);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function useCreateExam(navigate: NavigateFunction) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    duration: 60,
    startTime: '',
    questionPoolEnabled: false,
    poolSize: 0,
    questionsPerStudent: 0,
  });

  const computedEndTime = useMemo(() => {
    if (!formData.startTime || !formData.duration) return '';
    return addMinutes(formData.startTime, formData.duration);
  }, [formData.startTime, formData.duration]);

  const examSummary = useMemo(() => {
    const startLabel = formData.startTime ? formatDatetime(formData.startTime) : null;
    const endLabel = computedEndTime ? formatDatetime(computedEndTime) : null;
    return {
      title: formData.title || 'Sınav başlığı henüz girilmedi',
      description: formData.description || 'Açıklama eklendiğinde burada görünecek.',
      duration: formData.duration ? `${formData.duration} dakika` : 'Süre seçilmedi',
      dateRange:
        startLabel && endLabel
          ? `${startLabel} → ${endLabel}`
          : startLabel
          ? `${startLabel} → Süre girildiğinde hesaplanır`
          : 'Başlangıç zamanı belirlenmedi',
    };
  }, [formData, computedEndTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/exams', {
        ...formData,
        endTime: computedEndTime,
        published: false,
      });
      alert('Sınav oluşturuldu!');
      navigate('/instructor');
    } catch (error) {
      alert('Hata oluştu!');
      console.error(error);
    }
  };

  return { formData, setFormData, computedEndTime, examSummary, handleSubmit };
}
