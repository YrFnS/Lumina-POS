import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Sun, Moon, Languages, ShoppingBag, Trash2, History, Save, Tag, Lock, Unlock, AlertCircle, Star
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { Button } from '../../components/ui/Button';
import { OfflineIndicator } from '../../components/ui/OfflineIndicator';

import { ProductCard } from './components/ProductCard';
import { CartItemRow } from './components/CartItemRow';
import { CartOrderSettings } from './components/CartOrderSettings';
import { VariantModal } from './components/VariantModal';
import { DiscountModal } from './components/DiscountModal';
import { PaymentModal } from './components/PaymentModal';
import { ParkedOrdersModal } from './components/ParkedOrdersModal';
import { ShiftManagementModal } from './components/ShiftManagementModal';

export const POSView: React.FC = () => {
  const { 
    products, addToCart, cart, clearCart, parkOrder, completeOrder, 
    isRefundMode, toggleRefundMode, parkedOrders, lang, theme, toggleLang, toggleTheme,
    updateCartItemDiscount, globalDiscount, setGlobalDiscount, currentShift, categories
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVariantProduct, setActiveVariantProduct] = useState<Product | null>(null);
  const [showParkedOrders, setShowParkedOrders] = useState(false);
  
  // Modals state
  const [activeDiscountItem, setActiveDiscountItem] = useState<string | null>(null); // cartItemId
  const [showGlobalDiscount, setShowGlobalDiscount] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Local Keyboard Shortcuts
  useEffect(() => {
    const handleLocalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Only if no modal is active (simple check based on local state)
      if (activeVariantProduct || activeDiscountItem || showGlobalDiscount || showPayment || showParkedOrders || showShiftModal) return;

      if (e.code === 'Space') {
         e.preventDefault();
         if (cart.length > 0 && currentShift) {
           setShowPayment(true);
         }
      } else if (e.key === 'Escape') {
         if (cart.length > 0) {
           if (confirm('Clear entire cart?')) clearCart();
         }
      }
    };

    window.addEventListener('keydown', handleLocalKeyDown);
    return () => window.removeEventListener('keydown', handleLocalKeyDown);
  }, [activeVariantProduct, activeDiscountItem, showGlobalDiscount, showPayment, showParkedOrders, showShiftModal, cart.length, currentShift, clearCart]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.nameAr.includes(searchQuery) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCat = true;
      if (selectedCategory !== 'All') {
        matchesCat = p.categoryId === selectedCategory || p.category === selectedCategory; // Fallback for old data
      }
      
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Totals Logic
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product.price + item.selectedVariants.reduce((v, vari) => v + vari.priceModifier, 0);
    let itemDiscount = 0;
    if (item.discount) {
      itemDiscount = item.discount.type === 'percent' ? unitPrice * (item.discount.value / 100) : item.discount.value;
    }
    return sum + (Math.max(0, unitPrice - itemDiscount) * item.quantity);
  }, 0);

  let globalDiscountAmount = 0;
  if (globalDiscount) {
    globalDiscountAmount = globalDiscount.type === 'percent' ? subtotal * (globalDiscount.value / 100) : globalDiscount.value;
  }
  const total = Math.max(0, subtotal - globalDiscountAmount);

  // Handlers
  const handleProductClick = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setActiveVariantProduct(product);
    } else {
      addToCart(product);
    }
  };

  const isShiftClosed = !currentShift;

  const displayCategories = ['All', ...categories.map(c => ({ id: c.id, name: lang === 'en' ? c.name : c.nameAr }))];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
           <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tighter italic">LUMINA<span className="text-lumina-500">POS</span></h1>
            <OfflineIndicator />
            <button 
              onClick={() => setShowShiftModal(true)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${isShiftClosed ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
            >
              {isShiftClosed ? <Lock size={14} /> : <Unlock size={14} />}
              {isShiftClosed ? 'Shift Closed' : 'Shift Open'}
            </button>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative hidden md:block w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input 
                 type="text" 
                 placeholder={TRANSLATIONS.searchPlaceholder[lang]}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-lumina-500"
               />
             </div>
             <button onClick={toggleLang} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Languages size={20}/></button>
             <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
               {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
             </button>
          </div>
        </header>

        <div className="h-14 px-6 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur flex-shrink-0">
          {displayCategories.map((cat: any) => (
            <button
              key={typeof cat === 'string' ? cat : cat.id}
              onClick={() => setSelectedCategory(typeof cat === 'string' ? cat : cat.id)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors
                ${selectedCategory === (typeof cat === 'string' ? cat : cat.id)
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'}
              `}
            >
              {typeof cat === 'string' ? cat : cat.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
             {filteredProducts.map(product => (
               <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
             ))}
             {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <Search size={48} strokeWidth={1} className="mb-4" />
                  <p>No products found matching "{searchQuery}"</p>
                </div>
             )}
           </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col h-full shadow-2xl z-20">
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <span className="font-bold text-lg">Current Order</span>
            {parkedOrders.length > 0 && (
              <span onClick={() => setShowParkedOrders(true)} className="ml-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold cursor-pointer hover:bg-amber-200">
                {parkedOrders.length} Held
              </span>
            )}
          </div>
          <button onClick={clearCart} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" title="Clear Cart (Esc)">
            <Trash2 size={18} />
          </button>
        </div>

        <CartOrderSettings />

        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 relative">
           {cart.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 opacity-50">
               <ShoppingBag size={64} strokeWidth={1} className="mb-4" />
               <p className="text-xl font-medium">{TRANSLATIONS.emptyCart[lang]}</p>
             </div>
           ) : (
             <div className="pb-4">
                {cart.map(item => (
                  <CartItemRow 
                    key={item.cartItemId} 
                    item={item} 
                    onItemClick={() => {}} 
                    onDiscountClick={() => setActiveDiscountItem(item.cartItemId)}
                  />
                ))}
             </div>
           )}
        </div>

        {/* Warning if shift closed */}
        {isShiftClosed && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 border-y border-red-100 dark:border-red-900/50 flex items-center gap-3 text-red-700 dark:text-red-300">
             <AlertCircle size={20} className="flex-shrink-0" />
             <div className="text-sm font-bold leading-tight">{TRANSLATIONS.shiftClosedMsg[lang]}</div>
             <button onClick={() => setShowShiftModal(true)} className="ml-auto text-xs font-black underline uppercase">Open Shift</button>
          </div>
        )}

        <div className="px-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
             <label className="flex items-center cursor-pointer gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 select-none">
                <input type="checkbox" checked={isRefundMode} onChange={toggleRefundMode} className="w-4 h-4 accent-red-500"/>
                {TRANSLATIONS.refundMode[lang]}
             </label>
             <button onClick={() => setShowParkedOrders(true)} className="text-sm font-bold text-lumina-600 hover:underline flex items-center gap-1">
               <History size={14} /> {TRANSLATIONS.parkedOrders[lang]}
             </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-950 p-6 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
           <div className="space-y-2 mb-4 font-mono text-sm">
             <div className="flex justify-between text-gray-600 dark:text-gray-400">
               <span>{TRANSLATIONS.subtotal[lang]}</span>
               <span>${subtotal.toFixed(2)}</span>
             </div>
             
             {globalDiscount && (
               <div className="flex justify-between text-green-600 dark:text-green-400">
                 <span className="flex items-center gap-1">
                   {globalDiscount.description === 'Loyalty Reward' ? <Star size={12} fill="currentColor"/> : <Tag size={12}/>} 
                   {globalDiscount.description || `Discount ${globalDiscount.type === 'percent' ? `(${globalDiscount.value}%)` : ''}`}
                 </span>
                 <span>-${globalDiscountAmount.toFixed(2)}</span>
               </div>
             )}

             <div className="flex justify-between text-2xl font-bold pt-2 border-t border-gray-200 dark:border-gray-800 mt-2 text-gray-900 dark:text-white">
               <span>{TRANSLATIONS.total[lang]}</span>
               <span className={isRefundMode ? 'text-red-500' : ''}>
                 {isRefundMode ? '-' : ''}${total.toFixed(2)}
               </span>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-3 mb-3">
              <Button variant="secondary" onClick={() => setShowGlobalDiscount(true)} className="rounded-xl text-xs" size="sm">
                {globalDiscount ? 'Edit Discount' : TRANSLATIONS.addDiscount[lang]}
              </Button>
              <Button variant="secondary" onClick={parkOrder} className="rounded-xl text-xs" size="sm" disabled={cart.length === 0}>
                <Save size={14} className="mr-1" /> {TRANSLATIONS.park[lang]}
              </Button>
           </div>
           
           <Button 
            variant={isRefundMode ? 'danger' : 'primary'} 
            className="w-full rounded-xl shadow-lg shadow-gray-200 dark:shadow-none" 
            onClick={() => setShowPayment(true)} 
            disabled={cart.length === 0 || isShiftClosed}
            title="Press Space to Pay"
           >
              {isShiftClosed ? TRANSLATIONS.shiftClosed[lang].toUpperCase() : `${TRANSLATIONS.pay[lang]} $${total.toFixed(2)}`}
           </Button>
        </div>
      </div>
      
      {/* Modals */}
      <VariantModal 
        product={activeVariantProduct} 
        onClose={() => setActiveVariantProduct(null)} 
        onConfirm={(variants) => {
          if (activeVariantProduct) {
             addToCart(activeVariantProduct, variants);
             setActiveVariantProduct(null);
          }
        }} 
      />

      <DiscountModal 
        isOpen={activeDiscountItem !== null} 
        onClose={() => setActiveDiscountItem(null)} 
        onApply={(d) => activeDiscountItem && updateCartItemDiscount(activeDiscountItem, d)}
        currentDiscount={cart.find(c => c.cartItemId === activeDiscountItem)?.discount}
        title={TRANSLATIONS.itemDiscount[lang]}
      />

      <DiscountModal 
        isOpen={showGlobalDiscount} 
        onClose={() => setShowGlobalDiscount(false)} 
        onApply={setGlobalDiscount}
        currentDiscount={globalDiscount}
      />

      <PaymentModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        total={total}
        onComplete={(payments, tip) => {
          completeOrder(payments, tip);
          setShowPayment(false);
        }}
      />
      
      <ParkedOrdersModal 
        isOpen={showParkedOrders} 
        onClose={() => setShowParkedOrders(false)} 
      />

      <ShiftManagementModal 
        isOpen={showShiftModal} 
        onClose={() => setShowShiftModal(false)} 
      />
    </div>
  );
};