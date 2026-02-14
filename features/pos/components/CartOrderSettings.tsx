
import React, { useState, useMemo } from 'react';
import { User, X, Star, Pill } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { CustomerSelectionModal } from './CustomerSelectionModal';
import { PrescriptionListModal } from './PrescriptionListModal';
import { Prescription } from '../../../types';

export const CartOrderSettings: React.FC = () => {
  const { lang, selectedCustomer, setSelectedCustomer, setGlobalDiscount, prescriptions, products, addToCart, fulfillPrescription } = useStore();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);

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

  const pendingPrescriptions = useMemo(() => {
    if (!selectedCustomer) return [];
    return prescriptions.filter(rx => rx.customerId === selectedCustomer.id && rx.status === 'pending');
  }, [prescriptions, selectedCustomer]);

  const loadPrescription = (rx: Prescription) => {
    // Convert items to cart
    rx.items.forEach(item => {
      // Find full product details to ensure price/stock is accurate
      const product = products.find(p => p.id === item.productId);
      if (product) {
        // We call addToCart directly. Ideally we might want to check stock here.
        // We pass the dosage as a note.
        // Since addToCart increments by 1, we loop or update quantity.
        // For simplicity, we loop to hit the quantity count or logic needs update to accept qty.
        // Updating addToCart logic to accept quantity would be better, but for now let's just loop.
        // Actually, let's update addToCart logic in the hook or just loop here.
        // Looping is inefficient. Let's use addToCart simply and then maybe we should have updated the hook.
        // Wait, I updated hook to accept note, but not quantity.
        // I will just loop for now, it's rare to have massive quantity.
        for (let i = 0; i < item.quantity; i++) {
           addToCart(product, [], i === 0 ? `Rx: ${item.dosage}` : undefined);
        }
      }
    });

    fulfillPrescription(rx.id);
    setIsRxModalOpen(false);
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
      
      {/* Action Bar (Loyalty / Rx) */}
      {selectedCustomer && (
        <div className="flex gap-2">
           <div className="flex-1 flex justify-between items-center animate-in slide-in-from-top-2 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-xs font-bold text-lumina-600 dark:text-lumina-400">
                <Star size={14} fill="currentColor" />
                {selectedCustomer.points}
              </div>
              <button 
                onClick={handleRedeemPoints}
                className="text-[10px] font-black uppercase bg-lumina-100 text-lumina-700 px-3 py-1 rounded-full hover:bg-lumina-200 dark:bg-lumina-900/30 dark:text-lumina-300 transition-colors"
              >
                Redeem
              </button>
           </div>
           
           {pendingPrescriptions.length > 0 && (
             <button 
               onClick={() => setIsRxModalOpen(true)}
               className="animate-in slide-in-from-right-2 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 px-3 py-2 rounded-lg flex items-center gap-2 font-bold text-xs hover:bg-cyan-200 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800"
             >
                <Pill size={14} /> {pendingPrescriptions.length} Rx
             </button>
           )}
        </div>
      )}

      <CustomerSelectionModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
        onSelect={setSelectedCustomer} 
      />

      <PrescriptionListModal 
        isOpen={isRxModalOpen}
        onClose={() => setIsRxModalOpen(false)}
        prescriptions={pendingPrescriptions}
        onLoad={loadPrescription}
      />
    </div>
  );
};
