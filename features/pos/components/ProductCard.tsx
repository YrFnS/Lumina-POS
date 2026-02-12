import React from 'react';
import { Product } from '../../../types';
import { useStore } from '../../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { lang, theme } = useStore();
  const displayName = lang === 'en' ? product.name : product.nameAr;
  const isDark = theme === 'dark';
  const isLowStock = product.stock <= product.minStock;
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      onClick={!isOutOfStock ? onClick : undefined}
      className={`
        relative overflow-hidden group select-none
        border-2 transition-all duration-300 ease-out
        ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-white'}
        ${isOutOfStock 
          ? 'opacity-50 cursor-not-allowed grayscale' 
          : 'cursor-pointer hover:border-black dark:hover:border-lumina-500 hover:shadow-xl hover:-translate-y-1'
        }
        h-36 flex flex-col justify-between p-4 rounded-2xl
      `}
    >
      {/* Abstract Color Blob Background */}
      <div 
        className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 transition-all duration-500 group-hover:scale-[2.5] group-hover:opacity-20 blur-xl" 
        style={{ backgroundColor: product.color }}
      />
      
      <div className="z-10 flex justify-between items-start">
        <span className={`font-bold text-lg leading-tight w-3/4 line-clamp-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>
          {displayName}
        </span>
        {isLowStock && !isOutOfStock && (
          <span className="flex h-3 w-3 relative">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        )}
      </div>

      <div className="flex justify-between items-end z-10">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-50">{product.sku}</span>
          <span className={`font-mono text-xs font-bold ${isLowStock ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
            {isOutOfStock ? 'SOLD OUT' : `${product.stock} IN STOCK`}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono font-black text-xl tracking-tight">${product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};