import React, { useState } from 'react';
import { X, Search, UserPlus, Star } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../../components/ui/Button';
import { Customer } from '../../../types';

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { customers, lang, addCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'add'>('list');
  
  // Quick Add Form
  const [newCust, setNewCust] = useState({ name: '', phone: '' });

  if (!isOpen) return null;

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const handleQuickAdd = () => {
    if (!newCust.name || !newCust.phone) return;
    const customer: Customer = {
      id: Date.now().toString(),
      name: newCust.name,
      phone: newCust.phone,
      points: 0,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: 0,
      joinedAt: Date.now(),
      notes: ''
    };
    addCustomer(customer);
    onSelect(customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-lg">
            {view === 'list' ? TRANSLATIONS.selectCustomer[lang] : TRANSLATIONS.addCustomer[lang]}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        {view === 'list' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder={TRANSLATIONS.searchCustomer[lang]}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-lumina-500"
                />
              </div>
              <Button size="sm" onClick={() => setView('add')} className="rounded-lg">
                <UserPlus size={16} />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {filtered.map(c => (
                <button 
                  key={c.id}
                  onClick={() => { onSelect(c); onClose(); }}
                  className="w-full flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 text-left"
                >
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.phone}</div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="text-xs font-bold bg-lumina-50 text-lumina-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> {c.points}
                     </div>
                     <div className="text-xs text-gray-400 mt-1">
                       {c.visitCount} visits
                     </div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-gray-400">No customers found</div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
             <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name</label>
              <input 
                autoFocus
                type="text" 
                value={newCust.name}
                onChange={e => setNewCust({...newCust, name: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone</label>
              <input 
                type="tel" 
                value={newCust.phone}
                onChange={e => setNewCust({...newCust, phone: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-4">
               <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setView('list')}>Back</Button>
               <Button variant="primary" className="flex-1 rounded-xl" onClick={handleQuickAdd}>Create & Select</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};