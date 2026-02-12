import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../../components/ui/Button';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, category }) => {
  const { lang, addCategory, updateCategory } = useStore();
  const isEdit = !!category;

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    nameAr: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData(category);
      } else {
        setFormData({ name: '', nameAr: '' });
      }
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (isEdit && category) {
      updateCategory({ ...category, ...formData } as Category);
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name || '',
        nameAr: formData.nameAr || formData.name || ''
      };
      addCategory(newCategory);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEdit ? TRANSLATIONS.addCategory[lang].replace('Add', 'Edit') : TRANSLATIONS.addCategory[lang]}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name (EN)</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name (AR)</label>
            <input 
              type="text" 
              value={formData.nameAr}
              onChange={e => setFormData({...formData, nameAr: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none text-right"
              dir="rtl"
            />
          </div>

          <div className="pt-4 flex gap-3">
             <Button type="button" variant="secondary" className="flex-1 rounded-xl" onClick={onClose}>
               {TRANSLATIONS.cancel[lang]}
             </Button>
             <Button type="submit" variant="primary" className="flex-1 rounded-xl">
               {TRANSLATIONS.save[lang]}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};