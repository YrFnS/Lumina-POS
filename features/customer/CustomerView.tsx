import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { CartItem, Language, Theme, BroadcastMessage } from '../../types';
import { TRANSLATIONS } from '../../constants';

export const CustomerView: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const channel = new BroadcastChannel('lumina_pos');
    channel.onmessage = (event) => {
      const msg = event.data as BroadcastMessage;
      if (msg.type === 'SYNC_CART') {
        setCart(msg.payload.cart);
        setTotal(msg.payload.total);
        setLang(msg.payload.lang);
        setTheme(msg.payload.theme);
      }
    };
    
    if (theme === 'dark') document.documentElement.classList.add('dark');
    
    return () => channel.close();
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-hidden">
      <div className="h-24 flex items-center justify-between px-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
         <h1 className="text-4xl font-black italic tracking-tighter">LUMINA<span className="text-lumina-500">POS</span></h1>
         <div className="text-xl font-medium text-gray-500">{TRANSLATIONS.welcome[lang]}</div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-10 overflow-y-auto">
          {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-800">
               <ShoppingBag size={120} strokeWidth={0.5} />
               <p className="text-3xl font-light mt-6">Ready to order</p>
             </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => {
                 const name = lang === 'en' ? item.product.name : item.product.nameAr;
                 const price = item.product.price + item.selectedVariants.reduce((s, v) => s + v.priceModifier, 0);
                 const itemTotal = price * item.quantity;
                 
                 return (
                   <div key={item.cartItemId} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center animate-in slide-in-from-left-4 fade-in duration-500">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-xl text-gray-500">
                          {item.quantity}x
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{name}</h3>
                          {item.selectedVariants.length > 0 && (
                            <div className="text-gray-500 mt-1 text-sm">
                              {item.selectedVariants.map(v => v.name).join(', ')}
                            </div>
                          )}
                        </div>
                     </div>
                     <div className="text-2xl font-mono font-bold">
                       ${itemTotal.toFixed(2)}
                     </div>
                   </div>
                 );
              })}
            </div>
          )}
        </div>

        <div className="w-1/3 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-10 flex flex-col justify-center">
           <div className="space-y-6">
             <div className="flex justify-between items-end">
               <span className="text-2xl text-gray-500 font-bold uppercase tracking-wider">{TRANSLATIONS.total[lang]}</span>
               <span className="text-7xl font-black font-mono tracking-tighter">${total.toFixed(2)}</span>
             </div>
             
             {cart.length > 0 && (
               <div className="bg-lumina-50 dark:bg-lumina-900/10 p-6 rounded-2xl border border-lumina-100 dark:border-lumina-900/30">
                 <p className="text-center text-lumina-700 dark:text-lumina-300 text-lg">
                   {cart.length} {TRANSLATIONS.items[lang]} in cart
                 </p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};