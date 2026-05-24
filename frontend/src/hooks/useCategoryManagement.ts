import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

export interface Category {
  id?: number;
  name: string;
  description: string;
}

export function useCategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Category>({ name: '', description: '' });

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
  };
}
