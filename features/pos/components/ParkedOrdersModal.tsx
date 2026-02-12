import React from 'react';
import { X, RotateCcw, Clock } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../../components/ui/Button';

interface ParkedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParkedOrdersModal: React.FC<ParkedOrdersModalProps> = ({ isOpen, onClose }) => {
  const { parkedOrders, restoreOrder, lang } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 rounded-t-2xl">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="text-lumina-500" />
            {TRANSLATIONS.parkedOrders[lang]}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-black/20">
          {parkedOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-20 flex flex-col items-center">
              <Clock size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">{TRANSLATIONS.noParkedOrders[lang]}</p>
            </div>
          ) : (
            parkedOrders.map(order => (
              <div 
                key={order.id} 
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-lumina-500 dark:hover:border-lumina-500 transition-all shadow-sm"
              >
                <div className="flex-1">
                  <div className="font-bold text-lg flex items-center gap-2">
                    Order <span className="font-mono text-gray-400">#{order.id.slice(-4)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                    <span>•</span>
                    <span>{order.items.length} {TRANSLATIONS.item[lang]}(s)</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="font-mono font-bold text-xl">${order.total.toFixed(2)}</div>
                  <Button 
                    size="sm" 
                    onClick={() => { restoreOrder(order); onClose(); }}
                    className="rounded-lg shadow-lg shadow-lumina-500/20"
                  >
                    <RotateCcw size={16} className="mr-2"/> Restore
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};