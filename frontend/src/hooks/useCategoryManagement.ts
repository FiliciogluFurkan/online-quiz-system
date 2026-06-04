import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

export interface Category {
  id?: number;
  name: string;
  description: string;
}

export interface ManagedQuestion {
  id: number;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  questionText: string;
  points: number;
  correctAnswer?: string;
}

// geriye dönük ad
export type UncategorizedQuestion = ManagedQuestion;

export function useCategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Category>({ name: '', description: '' });
  const [uncategorized, setUncategorized] = useState<ManagedQuestion[]>([]);
  const [categoryQuestions, setCategoryQuestions] = useState<ManagedQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
  const [assigning, setAssigning] = useState(false);

  const loadUncategorized = useCallback(async () => {
    try {
      const res = await api.get('/questions/uncategorized');
      setUncategorized(res.data);
    } catch (error) {
      console.error('Error loading uncategorized questions:', error);
    }
  }, []);

  const loadCategoryQuestions = useCallback(async (categoryId: number) => {
    try {
      const res = await api.get(`/questions/category/${categoryId}`);
      setCategoryQuestions(res.data);
    } catch (error) {
      console.error('Error loading category questions:', error);
    }
  }, []);

  const toggleQuestion = (id: number) => {
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const assignSelectedToCategory = async () => {
    if (!editingCategory?.id || selectedQuestionIds.size === 0) return;
    setAssigning(true);
    try {
      const res = await api.put('/questions/bulk-category', {
        questionIds: Array.from(selectedQuestionIds),
        categoryId: editingCategory.id,
      });
      const { updated } = res.data as { updated: number };
      setSelectedQuestionIds(new Set());
      await Promise.all([loadUncategorized(), loadCategoryQuestions(editingCategory.id)]);
      alert(`${updated} soru "${editingCategory.name}" kategorisine eklendi.`);
    } catch (error) {
      console.error('Error assigning questions:', error);
      alert('Sorular kategoriye eklenirken hata oluştu!');
    } finally {
      setAssigning(false);
    }
  };

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Kategoriler yüklenirken hata oluştu!');
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Kategori adı gereklidir!');
      return;
    }
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        alert('Kategori güncellendi!');
      } else {
        await api.post('/categories', formData);
        alert('Kategori oluşturuldu!');
      }
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      setShowForm(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategori kaydedilirken hata oluştu!');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setShowForm(true);
    setSelectedQuestionIds(new Set());
    loadUncategorized();
    if (category.id) loadCategoryQuestions(category.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/categories/${id}`);
      alert('Kategori silindi!');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategori silinirken hata oluştu!');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowForm(false);
    setSelectedQuestionIds(new Set());
    setCategoryQuestions([]);
  };

  return {
    categories,
    showForm,
    setShowForm,
    editingCategory,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCancel,
    // kategoriye soru ekleme
    uncategorized,
    categoryQuestions,
    selectedQuestionIds,
    toggleQuestion,
    assignSelectedToCategory,
    assigning,
  };
}
