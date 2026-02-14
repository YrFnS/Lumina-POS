
import React, { useState, useEffect, useContext } from 'react';
import { Order, Language, Theme, ViewMode, Payment, HardwareConfig, FulfillmentStatus, StockMovement, CashTransaction, Prescription } from '../types';
import { TRANSLATIONS } from '../constants';
import { printReceipt } from '../utils/hardware';
import * as sound from '../utils/sound';

// Feature Hooks
import { useCustomerLogic } from '../features/crm/hooks/useCustomerLogic';
import { useInventoryLogic } from '../features/inventory/hooks/useInventoryLogic';
import { useCartLogic } from '../features/pos/hooks/useCartLogic';
import { useShiftLogic } from '../features/pos/hooks/useShiftLogic';

// Re-export types for consumers
export * from '../types';

interface StoreState {
  // Global
  lang: Language;
  theme: Theme;
  view: ViewMode;
  isOnline: boolean;
  hardwareConfig: HardwareConfig;
  isAiChatOpen: boolean; 
  toggleLang: () => void;
  toggleTheme: () => void;
  toggleAiChat: () => void; 
  setView: (view: ViewMode) => void;
  updateHardwareConfig: (config: HardwareConfig) => void;
  
  // From Inventory Hook
  products: any[];
  suppliers: any[];
  categories: any[];
  stockMovements: any[];
  addSupplier: (s: any) => void;
  updateSupplier: (s: any) => void;
  deleteSupplier: (id: string) => void;
  addCategory: (c: any) => void;
  updateCategory: (c: any) => void;
  deleteCategory: (id: string) => void;
  addProduct: (p: any) => void;
  editProduct: (p: any) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, stock: number) => void;

  // From Customer Hook
  customers: any[];
  selectedCustomer: any;
  setCustomerName: (name: string) => void; 
  setSelectedCustomer: (c: any) => void;
  addCustomer: (c: any) => void;
  updateCustomer: (c: any) => void;
  deleteCustomer: (id: string) => void;
  customerName: string;

  // From Cart Hook
  cart: any[];
  globalDiscount: any;
  isRefundMode: boolean;
  setGlobalDiscount: (d: any) => void;
  toggleRefundMode: () => void;
  addToCart: (p: any, v?: any[], note?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, d: number) => void;
  updateCartItemDiscount: (id: string, d: any) => void;
  updateCartItemNote: (id: string, n: string) => void;
  clearCart: () => void;

  // From Shift Hook
  currentShift: any;
  shiftHistory: any[];
  openShift: (float: number) => void;
  closeShift: (actual: number) => void;
  addCashTransaction: (t: any, a: number, r: string) => void;

  // Prescriptions
  prescriptions: Prescription[];
  addPrescription: (rx: Prescription) => void;
  fulfillPrescription: (id: string) => void;

  // Context Orchestration
  parkedOrders: Order[];
  salesHistory: Order[];
  parkOrder: () => void;
  restoreOrder: (o: Order) => void;
  completeOrder: (p: Payment[], t: number) => void;
  updateOrderFulfillment: (id: string, s: FulfillmentStatus) => void;
}

const StoreContext = React.createContext<StoreState | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global State
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<ViewMode>('pos');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  
  const [parkedOrders, setParkedOrders] = useState<Order[]>([]);
  const [salesHistory, setSalesHistory] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const [hardwareConfig, setHardwareConfig] = useState<HardwareConfig>({
    autoPrintReceipt: false, kickDrawer: false, showCustomerDisplay: false, soundEnabled: true, printerWidth: '80mm'
  });

  const playSound = (type: 'beep' | 'success' | 'error' | 'click') => {
    if (!hardwareConfig.soundEnabled) return;
    switch (type) {
      case 'beep': sound.playBeep(); break;
      case 'success': sound.playSuccess(); break;
      case 'error': sound.playError(); break;
      case 'click': sound.playClick(); break;
    }
  };

  // Compose Features
  const inventory = useInventoryLogic();
  const crm = useCustomerLogic((t) => playSound(t));
  const pos = useCartLogic((t) => playSound(t));
  const shift = useShiftLogic((t) => playSound(t));

  // Initialization & Effects
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    const load = (key: string, setter: any, def: any) => {
      const saved = localStorage.getItem(key);
      if (saved) setter(JSON.parse(saved));
      else setter(def);
    };

    load('lumina_parked', setParkedOrders, []);
    load('lumina_history', setSalesHistory, []);
    load('lumina_hardware', setHardwareConfig, hardwareConfig);
    load('lumina_prescriptions', setPrescriptions, []);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  useEffect(() => { localStorage.setItem('lumina_parked', JSON.stringify(parkedOrders)); }, [parkedOrders]);
  useEffect(() => { localStorage.setItem('lumina_history', JSON.stringify(salesHistory)); }, [salesHistory]);
  useEffect(() => { localStorage.setItem('lumina_hardware', JSON.stringify(hardwareConfig)); }, [hardwareConfig]);
  useEffect(() => { localStorage.setItem('lumina_prescriptions', JSON.stringify(prescriptions)); }, [prescriptions]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Global Actions
  const toggleTheme = () => { setTheme(prev => prev === 'light' ? 'dark' : 'light'); playSound('click'); };
  const toggleLang = () => { setLang(prev => prev === 'en' ? 'ar' : 'en'); playSound('click'); };
  const toggleAiChat = () => { setIsAiChatOpen(prev => !prev); playSound('click'); };
  const updateHardwareConfig = (config: HardwareConfig) => setHardwareConfig(config);

  const deleteProductWrapper = (id: string) => {
    inventory.deleteProduct(id);
    if (pos.cart.some(item => item.product.id === id)) {
      pos.setCart(prev => prev.filter(i => i.product.id !== id));
    }
  };

  // Prescription Logic
  const addPrescription = (rx: Prescription) => {
    setPrescriptions(prev => [rx, ...prev]);
    playSound('success');
  };

  const fulfillPrescription = (id: string) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: 'filled' } : p));
  };

  // Orchestrators (Complex Business Logic)
  const parkOrder = () => {
    if (pos.cart.length === 0) return;
    const subtotal = pos.cart.reduce((sum, item) => {
       const unitPrice = item.product.price + item.selectedVariants.reduce((v, vari) => v + vari.priceModifier, 0);
       let itemDiscount = 0;
       if (item.discount) itemDiscount = item.discount.type === 'percent' ? unitPrice * (item.discount.value / 100) : item.discount.value;
       return sum + (Math.max(0, unitPrice - itemDiscount) * item.quantity);
    }, 0);

    let globalDiscountAmount = 0;
    if (pos.globalDiscount) {
      globalDiscountAmount = pos.globalDiscount.type === 'percent' ? subtotal * (pos.globalDiscount.value / 100) : pos.globalDiscount.value;
    }
    const total = Math.max(0, subtotal - globalDiscountAmount);

    const order: Order = {
      id: Date.now().toString(),
      items: [...pos.cart], subtotal, discountAmount: globalDiscountAmount, tipAmount: 0, total, payments: [],
      status: 'parked', fulfillmentStatus: 'pending', 
      customerName: crm.selectedCustomer ? crm.selectedCustomer.name : customerName, customerId: crm.selectedCustomer?.id,
      createdAt: Date.now(), globalDiscount: pos.globalDiscount
    };
    setParkedOrders(prev => [order, ...prev]);
    pos.clearCart();
  };

  const restoreOrder = (order: Order) => {
    pos.setCart(order.items); 
    pos.setGlobalDiscount(order.globalDiscount);
    setCustomerName(order.customerName || '');
    if (order.customerId) { 
      const cust = crm.customers.find(c => c.id === order.customerId); 
      if (cust) crm.setSelectedCustomer(cust); 
    }
    setParkedOrders(prev => prev.filter(p => p.id !== order.id));
    playSound('beep');
  };

  const completeOrder = (payments: Payment[], tip: number) => {
    const orderId = Date.now().toString();
    const subtotal = pos.cart.reduce((sum, item) => {
        const unitPrice = item.product.price + item.selectedVariants.reduce((v, vari) => v + vari.priceModifier, 0);
        let itemDiscount = 0;
        if (item.discount) itemDiscount = item.discount.type === 'percent' ? unitPrice * (item.discount.value / 100) : item.discount.value;
        return sum + (Math.max(0, unitPrice - itemDiscount) * item.quantity);
    }, 0);

    let globalDiscountAmount = 0;
    if (pos.globalDiscount) {
      globalDiscountAmount = pos.globalDiscount.type === 'percent' ? subtotal * (pos.globalDiscount.value / 100) : pos.globalDiscount.value;
    }
    const total = Math.max(0, subtotal - globalDiscountAmount);

    // 1. Inventory & Movement
    if (!pos.isRefundMode) {
      const movements: StockMovement[] = [];
      inventory.setProducts(prev => {
        const newProducts = [...prev];
        pos.cart.forEach(item => {
          const idx = newProducts.findIndex(p => p.id === item.product.id);
          if (idx > -1) {
            newProducts[idx] = { ...newProducts[idx], stock: Math.max(0, newProducts[idx].stock - item.quantity) };
            movements.push({
              id: `${orderId}-${item.product.id}`, productId: item.product.id, productName: item.product.name,
              quantity: -item.quantity, type: 'sale', reason: `Order #${orderId.slice(-4)}`, timestamp: Date.now()
            });
          }
        });
        return newProducts;
      });
      inventory.setStockMovements(prev => [...movements, ...prev]);
    } else {
      const movements: StockMovement[] = [];
      inventory.setProducts(prev => {
        const newProducts = [...prev];
        pos.cart.forEach(item => {
          const idx = newProducts.findIndex(p => p.id === item.product.id);
          if (idx > -1) {
            newProducts[idx] = { ...newProducts[idx], stock: newProducts[idx].stock + item.quantity };
            movements.push({
              id: `${orderId}-${item.product.id}`, productId: item.product.id, productName: item.product.name,
              quantity: item.quantity, type: 'return', reason: `Return #${orderId.slice(-4)}`, timestamp: Date.now()
            });
          }
        });
        return newProducts;
      });
      inventory.setStockMovements(prev => [...movements, ...prev]);
    }

    // 2. Loyalty
    let pointsEarned = 0;
    let pointsRedeemed = 0;
    if (crm.selectedCustomer && !pos.isRefundMode) {
      pointsEarned = Math.floor(total);
      if (pos.globalDiscount && pos.globalDiscount.description === 'Loyalty Reward') { 
        pointsRedeemed = Math.ceil(pos.globalDiscount.value * 10); 
      }
      crm.setCustomers(prev => prev.map(c => {
        if (c.id === crm.selectedCustomer.id) {
          return { ...c, totalSpent: c.totalSpent + total, visitCount: c.visitCount + 1, lastVisit: Date.now(), points: c.points + pointsEarned - pointsRedeemed };
        }
        return c;
      }));
    }

    // 3. Shift
    if (shift.currentShift) {
       let cashChange = 0;
       payments.forEach(p => { if (p.method === 'cash') cashChange += p.amount; });
       if (pos.isRefundMode) cashChange = -cashChange;
       if (cashChange !== 0) {
         const tx: CashTransaction = { id: Date.now().toString(), type: pos.isRefundMode ? 'refund' : 'sale', amount: Math.abs(cashChange), reason: `Order #${orderId.slice(-4)}`, timestamp: Date.now(), relatedOrderId: orderId };
         shift.setCurrentShift(prev => {
           if (!prev) return null;
           return { ...prev, expectedCash: prev.expectedCash + cashChange, transactions: [...prev.transactions, tx] };
         });
       }
    }

    // 4. Record Order
    const finalOrder: Order = {
       id: orderId, items: [...pos.cart], subtotal, discountAmount: globalDiscountAmount, tipAmount: tip, total: total + tip, payments,
       status: pos.isRefundMode ? 'refunded' : 'completed', fulfillmentStatus: pos.isRefundMode ? 'cancelled' : 'fulfilled',
       customerName: crm.selectedCustomer ? crm.selectedCustomer.name : customerName, customerId: crm.selectedCustomer?.id,
       pointsEarned, pointsRedeemed, createdAt: Date.now(), globalDiscount: pos.globalDiscount
    };

    setSalesHistory(prev => [finalOrder, ...prev]);
    
    // Check if any prescription was loaded for this customer and mark as fulfilled?
    // We don't link directly yet, but future logic could go here.
    if (crm.selectedCustomer) {
       // Logic to mark loaded prescriptions as filled could be here if we tracked which prescription was loaded.
    }

    if (hardwareConfig.autoPrintReceipt) { printReceipt(finalOrder, hardwareConfig, lang); }
    playSound('success'); 
    alert(TRANSLATIONS.checkoutSuccess[lang]); 
    pos.clearCart();
    setCustomerName(''); 
    crm.setSelectedCustomer(null);
  };

  const updateOrderFulfillment = (orderId: string, status: FulfillmentStatus) => {
    setSalesHistory(prev => prev.map(o => o.id === orderId ? { ...o, fulfillmentStatus: status } : o));
    playSound('click');
  };

  return (
    <StoreContext.Provider value={{
      lang, theme, view, isOnline, hardwareConfig, isAiChatOpen, toggleLang, toggleTheme, toggleAiChat, setView, updateHardwareConfig,
      
      // Inventory
      products: inventory.products, suppliers: inventory.suppliers, categories: inventory.categories, stockMovements: inventory.stockMovements,
      addSupplier: inventory.addSupplier, updateSupplier: inventory.updateSupplier, deleteSupplier: inventory.deleteSupplier,
      addCategory: inventory.addCategory, updateCategory: inventory.updateCategory, deleteCategory: inventory.deleteCategory,
      addProduct: inventory.addProduct, editProduct: inventory.editProduct, deleteProduct: deleteProductWrapper, updateProductStock: inventory.updateProductStock,

      // CRM
      customers: crm.customers, selectedCustomer: crm.selectedCustomer, customerName, setCustomerName,
      setSelectedCustomer: crm.setSelectedCustomer, addCustomer: crm.addCustomer, updateCustomer: crm.updateCustomer, deleteCustomer: crm.deleteCustomer,

      // POS
      cart: pos.cart, globalDiscount: pos.globalDiscount, isRefundMode: pos.isRefundMode,
      setGlobalDiscount: pos.setGlobalDiscount, toggleRefundMode: pos.toggleRefundMode,
      addToCart: pos.addToCart, removeFromCart: pos.removeFromCart, updateQuantity: pos.updateQuantity,
      updateCartItemDiscount: pos.updateCartItemDiscount, updateCartItemNote: pos.updateCartItemNote, clearCart: pos.clearCart,

      // Shift
      currentShift: shift.currentShift, shiftHistory: shift.shiftHistory,
      openShift: shift.openShift, closeShift: shift.closeShift, addCashTransaction: shift.addCashTransaction,

      // Prescriptions
      prescriptions, addPrescription, fulfillPrescription,

      // Integration
      parkedOrders, salesHistory, parkOrder, restoreOrder, completeOrder, updateOrderFulfillment
    }}>
      {children}
    </StoreContext.Provider>
  );
};
