import React, { useState } from 'react';
import { Percent, DollarSign, Delete } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Discount } from '../../../types';
import { TRANSLATIONS } from '../../../constants';
import { useStore } from '../../../context/StoreContext';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (discount: Discount | undefined) => void;
  currentDiscount?: Discount;
  title?: string;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({ 
  isOpen, onClose, onApply, currentDiscount, title 
}) => {
  const { lang } = useStore();
  const [type, setType] = useState<'percent' | 'fixed'>(currentDiscount?.type || 'percent');
  const [value, setValue] = useState<string>(currentDiscount?.value.toString() || '');

  if (!isOpen) return null;

  const handleNumClick = (num: string) => {
    if (num === '.' && value.includes('.')) return;
    setValue(prev => prev + num);
  };

  const handleBackspace = () => setValue(prev => prev.slice(0, -1));

  const handleSubmit = () => {
    if (!value) {
      onApply(undefined);
    } else {
      onApply({ type, value: parseFloat(value) });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-lg">{title || TRANSLATIONS.addDiscount[lang]}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <Delete size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button 
              onClick={() => setType('percent')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${type === 'percent' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50'}`}
            >
              <Percent size={16} /> Percentage
            </button>
            <button 
              onClick={() => setType('fixed')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${type === 'fixed' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50'}`}
            >
              <DollarSign size={16} /> Fixed
            </button>
          </div>

          <div className="text-4xl font-mono font-bold text-center py-4 border-b dark:border-gray-800">
            {value || '0'}
            <span className="text-gray-400 text-2xl ml-1">{type === 'percent' ? '%' : '$'}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(num => (
              <button
                key={num}
                onClick={() => handleNumClick(num.toString())}
                className="h-14 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              ⌫
            </button>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => { setValue(''); onApply(undefined); onClose(); }}>
              Remove
            </Button>
            <Button variant="primary" className="flex-[2] rounded-xl" onClick={handleSubmit}>
              {TRANSLATIONS.apply[lang]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};