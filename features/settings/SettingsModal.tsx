import React from 'react';
import { X, Printer, Monitor, MonitorUp, Receipt, Volume2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { TRANSLATIONS, MOCK_PRODUCTS } from '../../constants';
import { HardwareConfig } from '../../types';
import { Button } from '../../components/ui/Button';
import { printReceipt } from '../../utils/hardware';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { lang, hardwareConfig, updateHardwareConfig } = useStore();

  if (!isOpen) return null;

  const toggle = (key: keyof HardwareConfig) => {
    updateHardwareConfig({ ...hardwareConfig, [key]: !hardwareConfig[key] });
  };

  const openCustomerDisplay = () => {
    window.open(`${window.location.origin}${window.location.pathname}?mode=customer`, 'LuminaCustomerDisplay', 'width=800,height=600,menubar=no,toolbar=no');
  };

  const handleTestPrint = () => {
    const dummyOrder: any = {
      id: 'TEST-001',
      items: [
        { product: MOCK_PRODUCTS[0], quantity: 1, selectedVariants: [] },
        { product: MOCK_PRODUCTS[1], quantity: 2, selectedVariants: [] }
      ],
      subtotal: 12.50,
      discountAmount: 0,
      total: 12.50,
      createdAt: Date.now()
    };
    printReceipt(dummyOrder, hardwareConfig, lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Monitor className="text-lumina-500" />
            {TRANSLATIONS.hardware[lang]}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Printer size={16} /> Printer & Drawer
            </h3>
            
            <div className="flex items-center justify-between">
              <span>{TRANSLATIONS.autoPrint[lang]}</span>
              <input 
                type="checkbox" 
                checked={hardwareConfig.autoPrintReceipt}
                onChange={() => toggle('autoPrintReceipt')}
                className="w-5 h-5 accent-lumina-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span>{TRANSLATIONS.kickDrawer[lang]}</span>
              <input 
                type="checkbox" 
                checked={hardwareConfig.kickDrawer}
                onChange={() => toggle('kickDrawer')}
                className="w-5 h-5 accent-lumina-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span>{TRANSLATIONS.printerWidth[lang]}</span>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button 
                  onClick={() => updateHardwareConfig({...hardwareConfig, printerWidth: '58mm'})}
                  className={`px-3 py-1 rounded text-xs font-bold ${hardwareConfig.printerWidth === '58mm' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50'}`}
                >
                  58mm
                </button>
                <button 
                  onClick={() => updateHardwareConfig({...hardwareConfig, printerWidth: '80mm'})}
                  className={`px-3 py-1 rounded text-xs font-bold ${hardwareConfig.printerWidth === '80mm' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50'}`}
                >
                  80mm
                </button>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={handleTestPrint} className="w-full">
              <Receipt size={16} className="mr-2" /> {TRANSLATIONS.testPrint[lang]}
            </Button>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <MonitorUp size={16} /> UX & Display
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Volume2 size={16} /> {TRANSLATIONS.soundEffects[lang]}</span>
              <input 
                type="checkbox" 
                checked={hardwareConfig.soundEnabled}
                onChange={() => toggle('soundEnabled')}
                className="w-5 h-5 accent-lumina-500"
              />
            </div>

            <div className="flex items-center justify-between">
               <span>{TRANSLATIONS.customerDisplay[lang]}</span>
               <input 
                type="checkbox" 
                checked={hardwareConfig.showCustomerDisplay}
                onChange={() => toggle('showCustomerDisplay')}
                className="w-5 h-5 accent-lumina-500"
              />
            </div>

            <Button variant="primary" onClick={openCustomerDisplay} className="w-full">
               {TRANSLATIONS.openDisplay[lang]}
            </Button>
            <p className="text-xs text-gray-500 text-center">Opens a new window. Drag to secondary screen.</p>
          </div>
        </div>
      </div>
    </div>
  );
};