import React, { useState } from 'react';
import { Users, Search, PlusCircle, Star, Phone, Mail, Calendar, Edit2, Trash2, Award } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { TRANSLATIONS } from '../../constants';
import { Button } from '../../components/ui/Button';
import { CustomerFormModal } from './components/CustomerFormModal';
import { Customer } from '../../types';

export const CRMView: React.FC = () => {
  const { customers, lang, deleteCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (c: Customer) => {
    setEditingCustomer(c);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
    }
  };

  const getTier = (points: number) => {
    if (points > 1000) return { name: 'Platinum', color: 'bg-purple-100 text-purple-700' };
    if (points > 500) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-700' };
    return { name: 'Member', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-black font-sans">
      <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-black italic flex items-center gap-2">
          <Users className="text-lumina-500" /> {TRANSLATIONS.crm[lang]}
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder={TRANSLATIONS.searchCustomer[lang]}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-lumina-500"
            />
          </div>
          <Button size="sm" onClick={handleAdd} className="rounded-lg">
             <PlusCircle size={16} className="mr-2" /> {TRANSLATIONS.addCustomer[lang]}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(c => {
             const tier = getTier(c.points);
             return (
              <div key={c.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{c.name}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.color}`}>
                        {tier.name}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => handleEdit(c)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-blue-500">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                   <div className="flex items-center gap-2">
                     <Phone size={14} /> {c.phone}
                   </div>
                   {c.email && (
                     <div className="flex items-center gap-2">
                       <Mail size={14} /> {c.email}
                     </div>
                   )}
                   <div className="flex items-center gap-2">
                     <Calendar size={14} /> Joined {new Date(c.joinedAt).toLocaleDateString()}
                   </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                  <div className="bg-lumina-50 dark:bg-lumina-900/10 p-3 rounded-xl">
                    <div className="text-xs text-lumina-700 dark:text-lumina-300 font-bold uppercase">{TRANSLATIONS.points[lang]}</div>
                    <div className="text-2xl font-black text-lumina-600 dark:text-lumina-400 flex items-center gap-1">
                      <Star size={16} fill="currentColor" /> {c.points}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                    <div className="text-xs text-gray-500 font-bold uppercase">Spent</div>
                    <div className="text-2xl font-black text-gray-700 dark:text-gray-300">
                      ${c.totalSpent.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
             );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Users size={64} className="mb-4 opacity-20" />
            <p>No customers found.</p>
          </div>
        )}
      </div>

      <CustomerFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        customer={editingCustomer} 
      />
    </div>
  );
};