import { useEffect, useMemo, useState } from 'react';
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
  published: boolean;
}

function addMinutes(datetimeLocal: string, minutes: number): string {
  if (!datetimeLocal) return '';
  const date = new Date(datetimeLocal);
  date.setMinutes(date.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDatetimeLocal(isoString: string | null | undefined): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
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

const initialState: FormData = {
  title: '',
  description: '',
  duration: 60,
  startTime: '',
  questionPoolEnabled: false,
  poolSize: 0,
  questionsPerStudent: 0,
  published: false,
};

export function useCreateExam(navigate: NavigateFunction, examId?: string) {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!examId);
  const isEditMode = !!examId;

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    api.get(`/exams/${examId}`)
      .then(res => {
        const e = res.data;
        setFormData({
          title: e.title || '',
          description: e.description || '',
          duration: e.duration || 0,
          startTime: toDatetimeLocal(e.startTime),
          questionPoolEnabled: !!e.questionPoolEnabled,
          poolSize: e.poolSize || 0,
          questionsPerStudent: e.questionsPerStudent || 0,
          published: !!e.published,
        });
      })
      .catch(err => {
        console.error('Sınav yüklenemedi:', err);
        alert('Sınav bilgileri yüklenemedi.');
      })
      .finally(() => setLoading(false));
  }, [examId]);

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
    if (!formData.title.trim()) {
      alert('Sınav başlığı zorunludur.');
      return;
    }
    if (!formData.duration || formData.duration < 1) {
      alert('Sınav süresi en az 1 dakika olmalıdır.');
      return;
    }
    if (!formData.startTime) {
      alert('Başlangıç zamanını seçmen gerekiyor.');
      return;
    }
    if (formData.questionPoolEnabled) {
      if (!formData.poolSize || formData.poolSize < 1) {
        alert('Havuz boyutu en az 1 olmalı.');
        return;
      }
      if (!formData.questionsPerStudent || formData.questionsPerStudent < 1) {
        alert('Öğrenci başına soru sayısı en az 1 olmalı.');
        return;
      }
      if (formData.questionsPerStudent > formData.poolSize) {
        alert('Öğrenci başına soru sayısı, havuz boyutundan büyük olamaz.');
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        endTime: computedEndTime,
      };
      if (isEditMode) {
        await api.put(`/exams/${examId}`, payload);
        navigate(`/instructor/exam/${examId}`);
      } else {
        await api.post('/exams', { ...payload, published: false });
        navigate('/instructor');
      }
    } catch (error) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Hata oluştu! Form veriniz korundu, tekrar deneyebilirsin.';
      alert(msg);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    computedEndTime,
    examSummary,
    handleSubmit,
    saving,
    loading,
    isEditMode,
  };
}
