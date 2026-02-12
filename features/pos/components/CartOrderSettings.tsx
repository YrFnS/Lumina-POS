import React, { useState } from 'react';
import { User, X, Star } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { CustomerSelectionModal } from './CustomerSelectionModal';

export const CartOrderSettings: React.FC = () => {
  const { lang, selectedCustomer, setSelectedCustomer, setGlobalDiscount } = useStore();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const handleRedeemPoints = () => {
    if (!selectedCustomer) return;
    
    if (selectedCustomer.points < 50) {
      alert("Need at least 50 points to redeem a $5 reward.");
      return;
    }
    
    if (confirm(`Redeem 50 points for a $5.00 discount?`)) {
       setGlobalDiscount({ type: 'fixed', value: 5.00, description: 'Loyalty Reward' });
    }
  };

  return (
    <div className="flex flex-col border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4 gap-3">
       {/* Customer Selector */}
       <div 
         onClick={() => setIsCustomerModalOpen(true)}
         className={`flex-1 flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border cursor-pointer transition-all hover:border-lumina-500 hover:shadow-md ${selectedCustomer ? 'border-lumina-500 ring-1 ring-lumina-500/20' : 'border-gray-200 dark:border-gray-700'}`}
       >
         <div className="flex items-center overflow-hidden">
           <User size={18} className={`mr-3 flex-shrink-0 ${selectedCustomer ? 'text-lumina-500' : 'text-gray-400'}`} />
           <span className={`text-sm font-bold truncate ${selectedCustomer ? 'text-black dark:text-white' : 'text-gray-500'}`}>
             {selectedCustomer ? selectedCustomer.name : TRANSLATIONS.guest[lang]}
           </span>
         </div>
         
         {selectedCustomer && (
           <button 
             onClick={(e) => { e.stopPropagation(); setSelectedCustomer(null); }}
             className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full ml-1"
           >
             <X size={14} />
           </button>
         )}
       </div>
      
      {/* Loyalty Status Bar */}
      {selectedCustomer && (
        <div className="flex justify-between items-center animate-in slide-in-from-top-2 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-1.5 text-xs font-bold text-lumina-600 dark:text-lumina-400">
             <Star size={14} fill="currentColor" />
             {selectedCustomer.points} Points
           </div>
           <button 
             onClick={handleRedeemPoints}
             className="text-[10px] font-black uppercase bg-lumina-100 text-lumina-700 px-3 py-1 rounded-full hover:bg-lumina-200 dark:bg-lumina-900/30 dark:text-lumina-300 transition-colors"
           >
             Redeem Reward
           </button>
        </div>
      )}

      <CustomerSelectionModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
        onSelect={setSelectedCustomer} 
      />
    </div>
  );
};