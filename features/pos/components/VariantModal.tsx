import React, { useState } from 'react';
import { Product, ProductVariant } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../../components/ui/Button';

interface VariantModalProps { 
  product: Product | null;
  onClose: () => void;
  onConfirm: (variants: ProductVariant[]) => void;
}

export const VariantModal: React.FC<VariantModalProps> = ({ product, onClose, onConfirm }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { lang } = useStore();

  if (!product) return null;

  const toggleVariant = (vId: string) => {
    const newSet = new Set(selected);
    if (newSet.has(vId)) newSet.delete(vId);
    else newSet.add(vId);
    setSelected(newSet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h3 className="text-xl font-bold">{lang === 'en' ? product.name : product.nameAr}</h3>
          <p className="text-sm text-gray-500">{TRANSLATIONS.variants[lang]}</p>
        </div>
        
        <div className="p-6 space-y-3 overflow-y-auto">
          {product.variants?.map(v => (
            <button
              key={v.id}
              onClick={() => toggleVariant(v.id)}
              className={`w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all ${
                selected.has(v.id) 
                  ? 'border-lumina-500 bg-lumina-50 dark:bg-lumina-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="font-medium">{v.name}</span>
              <span className="font-mono text-sm">+${v.priceModifier.toFixed(2)}</span>
            </button>
          ))}
          {(!product.variants || product.variants.length === 0) && (
            <div className="text-center text-gray-500 py-4">No variants available</div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex gap-3 flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
          <Button variant="secondary" className="flex-1 rounded-xl" onClick={onClose}>{TRANSLATIONS.cancel[lang]}</Button>
          <Button variant="primary" className="flex-1 rounded-xl" onClick={() => onConfirm(product.variants?.filter(v => selected.has(v.id)) || [])}>{TRANSLATIONS.confirm[lang]}</Button>
        </div>
      </div>
    </div>
  );
};