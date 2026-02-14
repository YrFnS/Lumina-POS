
import React from 'react';
import { X, Pill, Check, Clock } from 'lucide-react';
import { Prescription, Product } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../../components/ui/Button';

interface PrescriptionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptions: Prescription[];
  onLoad: (rx: Prescription) => void;
}

export const PrescriptionListModal: React.FC<PrescriptionListModalProps> = ({ isOpen, onClose, prescriptions, onLoad }) => {
  const { lang } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950 rounded-t-3xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Pill className="text-cyan-500" />
            {TRANSLATIONS.pendingRx[lang]}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {prescriptions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No pending prescriptions found.</div>
          ) : (
            prescriptions.map(rx => (
              <div key={rx.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-cyan-500 transition-colors bg-white dark:bg-gray-900">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Prescription #{rx.id.slice(-6)}</div>
                       <div className="font-bold text-lg">{rx.doctorName}</div>
                       <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Clock size={10} /> {new Date(rx.createdAt).toLocaleString()}
                       </div>
                    </div>
                    <Button size="sm" onClick={() => onLoad(rx)} className="rounded-xl bg-cyan-600 hover:bg-cyan-700 border-cyan-600 text-white">
                       {TRANSLATIONS.loadRx[lang]}
                    </Button>
                 </div>

                 <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
                    {rx.items.map((item, idx) => (
                       <div key={idx} className="flex justify-between text-sm">
                          <span className="font-medium">{item.productName} <span className="text-gray-400">x{item.quantity}</span></span>
                          <span className="text-gray-500 italic">{item.dosage}</span>
                       </div>
                    ))}
                 </div>
                 {rx.notes && (
                    <div className="mt-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                       <span className="font-bold">Note:</span> {rx.notes}
                    </div>
                 )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
