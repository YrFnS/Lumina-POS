import React, { useState } from 'react';
import { Tag, Trash2, Minus, Plus, MessageSquare } from 'lucide-react';
import { CartItem } from '../../../types';
import { useStore } from '../../../context/StoreContext';

interface CartItemRowProps {
  item: CartItem;
  onItemClick: () => void;
  onDiscountClick: () => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item, onItemClick, onDiscountClick }) => {
  const { lang, updateQuantity, isRefundMode, updateCartItemNote } = useStore();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const displayName = lang === 'en' ? item.product.name : item.product.nameAr;
  
  // Base price + variants
  const unitPrice = item.product.price + item.selectedVariants.reduce((sum, v) => sum + v.priceModifier, 0);
  
  // Calculate discount
  let discountAmount = 0;
  if (item.discount) {
    if (item.discount.type === 'percent') {
      discountAmount = unitPrice * (item.discount.value / 100);
    } else {
      discountAmount = item.discount.value;
    }
  }

  const finalUnitPrice = Math.max(0, unitPrice - discountAmount);
  const total = finalUnitPrice * item.quantity;

  return (
    <div className={`flex flex-col p-4 border-b border-gray-100 dark:border-gray-800 animate-in slide-in-from-left-2 duration-300 ${isRefundMode ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="cursor-pointer hover:opacity-70 flex-1" onClick={onItemClick}>
          <h4 className="font-bold text-base flex items-center gap-2">
            {displayName} 
            {item.discount && (
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded flex items-center">
                <Tag size={10} className="mr-1"/>
                {item.discount.type === 'percent' ? `${item.discount.value}%` : `$${item.discount.value}`}
              </span>
            )}
          </h4>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-1 mt-1">
            {item.selectedVariants.map((v) => (
              <span key={v.id} className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded border border-gray-200 dark:border-gray-600">
                {v.name}
              </span>
            ))}
          </div>
        </div>
        <div className="font-mono font-bold text-lg">
          {isRefundMode && '-'}${total.toFixed(2)}
        </div>
      </div>
      
      {/* Note Section */}
      {isEditingNote ? (
        <div className="mb-2 flex gap-2">
          <input 
            type="text" 
            autoFocus
            placeholder="Add note..." 
            className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-lumina-500"
            defaultValue={item.note}
            onBlur={(e) => {
              updateCartItemNote(item.cartItemId, e.target.value);
              setIsEditingNote(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateCartItemNote(item.cartItemId, e.currentTarget.value);
                setIsEditingNote(false);
              }
            }}
          />
        </div>
      ) : item.note && (
        <div 
          onClick={() => setIsEditingNote(true)}
          className="mb-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded w-fit cursor-pointer hover:underline"
        >
          Note: {item.note}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="font-mono text-sm text-gray-500 flex items-center gap-2">
           {item.discount && <span className="line-through opacity-50 text-xs">${unitPrice.toFixed(2)}</span>}
           <span>${finalUnitPrice.toFixed(2)} / unit</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsEditingNote(prev => !prev)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${item.note ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            title="Add Note"
          >
            <MessageSquare size={14} />
          </button>

          <button 
            onClick={onDiscountClick}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${item.discount ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            title="Discount Item"
          >
            <Tag size={14} />
          </button>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <button 
            onClick={() => updateQuantity(item.cartItemId, -1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
          </button>
          <span className="font-mono font-bold w-8 text-center">{item.quantity}</span>
          <button 
            onClick={() => updateQuantity(item.cartItemId, 1)}
            disabled={item.quantity >= item.product.stock}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white dark:bg-lumina-500 dark:text-gray-900 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};