import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, Package, Settings, BarChart3, Users } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { useBarcodeScanner } from './utils/hardware';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { POSView } from './features/pos';
import { InventoryView } from './features/inventory';
import { ReportsView } from './features/reports';
import { CRMView } from './features/crm';
import { CustomerView } from './features/customer';
import { SettingsModal } from './features/settings';

const AppLayout: React.FC = () => {
  const { view, setView, products, addToCart, hardwareConfig, cart, lang, theme } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  // Global Hardware Hooks
  const handleScan = useCallback((product) => {
    addToCart(product);
  }, [addToCart]);
  
  useBarcodeScanner(products, handleScan, false);
  useKeyboardShortcuts();

  // Sync with Customer Display
  useEffect(() => {
    if (!hardwareConfig.showCustomerDisplay) return;
    
    // Recalculate basic totals for broadcast
    const subtotal = cart.reduce((sum, item) => {
      const unitPrice = item.product.price + item.selectedVariants.reduce((v, vari) => v + vari.priceModifier, 0);
      let itemDiscount = 0;
      if (item.discount) {
        itemDiscount = item.discount.type === 'percent' ? unitPrice * (item.discount.value / 100) : item.discount.value;
      }
      return sum + (Math.max(0, unitPrice - itemDiscount) * item.quantity);
    }, 0);
    
    const channel = new BroadcastChannel('lumina_pos');
    channel.postMessage({
      type: 'SYNC_CART',
      payload: { cart, total: subtotal, subtotal, lang, theme }
    });
    
    return () => channel.close();
  }, [cart, hardwareConfig.showCustomerDisplay, lang, theme]);

  const NavButton = ({ target, icon: Icon, shortcut }: { target: string, icon: any, shortcut?: string }) => (
    <button 
      onClick={() => setView(target as any)} 
      className={`p-3 rounded-xl transition-all relative group ${view === target ? 'bg-black text-white dark:bg-lumina-500 dark:text-black shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'}`}
      title={shortcut}
    >
      <Icon size={24} />
      {shortcut && <span className="absolute right-0 top-0 text-[10px] bg-gray-200 text-gray-800 px-1 rounded opacity-0 group-hover:opacity-100">{shortcut}</span>}
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      <div className="hidden md:flex flex-col w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
            <div className="w-8 h-8 bg-lumina-500 rounded-lg flex items-center justify-center text-white font-black italic">L</div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-4 py-6">
          <NavButton target="pos" icon={LayoutGrid} shortcut="F1" />
          <NavButton target="inventory" icon={Package} shortcut="F2" />
          <NavButton target="crm" icon={Users} shortcut="F3" />
          <NavButton target="reports" icon={BarChart3} shortcut="F4" />
          <div className="flex-1"></div>
          <button onClick={() => setShowSettings(true)} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><Settings size={24} /></button>
        </div>
      </div>
      
      {view === 'pos' && <POSView />}
      {view === 'inventory' && <InventoryView />}
      {view === 'crm' && <CRMView />}
      {view === 'reports' && <ReportsView />}
      
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default function App() {
  const [isCustomerMode, setIsCustomerMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'customer') {
      setIsCustomerMode(true);
    }
  }, []);

  if (isCustomerMode) {
    return <CustomerView />;
  }

  return (
    <StoreProvider>
      <AppLayout />
    </StoreProvider>
  );
}