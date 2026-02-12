import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Supplier } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../../components/ui/Button';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, supplier }) => {
  const { lang, addSupplier, updateSupplier } = useStore();
  const isEdit = !!supplier;

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData(supplier);
      } else {
        setFormData({ name: '', contactName: '', phone: '', email: '', address: '' });
      }
    }
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (isEdit && supplier) {
      updateSupplier({ ...supplier, ...formData } as Supplier);
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        name: formData.name || '',
        contactName: formData.contactName || '',
        phone: formData.phone || '',
        email: formData.email,
        address: formData.address
      };
      addSupplier(newSupplier);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEdit ? TRANSLATIONS.editSupplier[lang] : TRANSLATIONS.addSupplier[lang]}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Company Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Person</label>
            <input 
              type="text" 
              value={formData.contactName}
              onChange={e => setFormData({...formData, contactName: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{TRANSLATIONS.phone[lang]}</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{TRANSLATIONS.email[lang]}</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{TRANSLATIONS.address[lang]}</label>
            <textarea 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none h-20 resize-none"
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