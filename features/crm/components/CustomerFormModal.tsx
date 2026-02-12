import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Customer } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../../components/ui/Button';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, customer }) => {
  const { lang, addCustomer, updateCustomer } = useStore();
  const isEdit = !!customer;

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData(customer);
      } else {
        setFormData({ name: '', phone: '', email: '', notes: '' });
      }
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && customer) {
      updateCustomer({ ...customer, ...formData } as Customer);
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: formData.name || 'Unknown',
        phone: formData.phone || '',
        email: formData.email,
        notes: formData.notes,
        points: 0,
        totalSpent: 0,
        visitCount: 0,
        lastVisit: 0,
        joinedAt: Date.now(),
      };
      addCustomer(newCustomer);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEdit ? TRANSLATIONS.editCustomer[lang] : TRANSLATIONS.addCustomer[lang]}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{TRANSLATIONS.customer[lang]} Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{TRANSLATIONS.phone[lang]}</label>
            <input 
              required
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none font-mono"
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
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{TRANSLATIONS.note[lang]}</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none h-24 resize-none"
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