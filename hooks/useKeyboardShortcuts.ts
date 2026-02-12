
import { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const useKeyboardShortcuts = () => {
  const { view, setView, cart, clearCart, toggleTheme, toggleAiChat } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      switch(e.key) {
        // Navigation
        case 'F1': e.preventDefault(); setView('pos'); break;
        case 'F2': e.preventDefault(); setView('inventory'); break;
        case 'F3': e.preventDefault(); setView('crm'); break;
        case 'F4': e.preventDefault(); setView('reports'); break;
        case 'F5': e.preventDefault(); toggleAiChat(); break;
        
        // Actions
        case 'Escape': 
           if (view === 'pos' && cart.length > 0) {
             // Let POSView handle modal closing, this is for cart clearing fallback
             // We can assume if no modal is open (hard to check here), we clear cart
             // This logic is tricky without modal state, so we'll leave detailed clearing to POSView
           }
           break;
        case 'F8': toggleTheme(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, setView, cart, clearCart, toggleTheme, toggleAiChat]);
};
