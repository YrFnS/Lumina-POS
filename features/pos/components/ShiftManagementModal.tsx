import React, { useState } from 'react';
import { X, DollarSign, Lock, Unlock, ArrowDown, ArrowUp, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../../components/ui/Button';

interface ShiftManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Keypad = ({ onEnter, enterLabel = "Enter", onNumInput, onBackspace, amount }: { onEnter: () => void, enterLabel?: string, onNumInput: (val: string) => void, onBackspace: () => void, amount: string }) => (
  <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto mt-4">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(n => (
      <button
        key={n}
        onClick={() => onNumInput(n.toString())}
        className="h-14 rounded-xl bg-gray-50 dark:bg-gray-800 text-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {n}
      </button>
    ))}
    <button 
      onClick={onBackspace}
      className="h-14 rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20 font-bold text-xl"
    >
      ⌫
    </button>
    <button 
      onClick={onEnter}
      disabled={!amount}
      className="col-span-3 h-14 rounded-xl bg-lumina-500 text-white font-bold text-lg hover:bg-lumina-600 disabled:opacity-50"
    >
      {enterLabel}
    </button>
  </div>
);

export const ShiftManagementModal: React.FC<ShiftManagementModalProps> = ({ isOpen, onClose }) => {
  const { lang, currentShift, openShift, closeShift, addCashTransaction } = useStore();
  const [view, setView] = useState<'dashboard' | 'open' | 'close' | 'transaction'>('dashboard');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [txType, setTxType] = useState<'drop' | 'payout'>('payout');

  // Determine initial view based on shift status
  // FIXED: Moved useEffect before any early return to prevent "Rendered fewer hooks than expected" error
  React.useEffect(() => {
    if (isOpen) {
      if (!currentShift) setView('open');
      else setView('dashboard');
      setAmount('');
      setReason('');
    }
  }, [isOpen, currentShift]);

  if (!isOpen) return null;

  const handleNumInput = (val: string) => {
    if (val === '.' && amount.includes('.')) return;
    setAmount(prev => prev + val);
  };
  
  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleOpenShift = () => {
    const float = parseFloat(amount) || 0;
    openShift(float);
    setAmount('');
    setView('dashboard');
  };

  const handleCloseShift = () => {
    const actual = parseFloat(amount) || 0;
    closeShift(actual);
    onClose();
  };

  const handleTransaction = () => {
    const val = parseFloat(amount) || 0;
    if (val > 0 && reason) {
      addCashTransaction(txType, val, reason);
      setView('dashboard');
      setAmount('');
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {currentShift ? <Unlock className="text-green-500" /> : <Lock className="text-red-500" />}
            {TRANSLATIONS.shiftManagement[lang]}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Views */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* VIEW: OPEN SHIFT */}
          {view === 'open' && (
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bold mb-2">{TRANSLATIONS.openShift[lang]}</h3>
              <p className="text-gray-500 mb-8">{TRANSLATIONS.startFloat[lang]}</p>
              
              <div className="text-5xl font-mono font-black mb-8 border-b-2 border-lumina-500 pb-2 w-full text-center">
                ${amount || '0.00'}
              </div>

              <Keypad 
                onEnter={handleOpenShift} 
                enterLabel="Start Shift" 
                onNumInput={handleNumInput} 
                onBackspace={handleBackspace} 
                amount={amount} 
              />
            </div>
          )}

          {/* VIEW: DASHBOARD */}
          {view === 'dashboard' && currentShift && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">{TRANSLATIONS.startFloat[lang]}</div>
                  <div className="text-3xl font-mono font-bold">${currentShift.startFloat.toFixed(2)}</div>
                </div>
                <div className="bg-lumina-50 dark:bg-lumina-900/10 p-6 rounded-2xl border border-lumina-100 dark:border-lumina-900/30">
                  <div className="text-sm text-lumina-700 dark:text-lumina-300 uppercase font-bold tracking-wider mb-2">{TRANSLATIONS.expectedCash[lang]}</div>
                  <div className="text-4xl font-mono font-black text-lumina-600 dark:text-lumina-400">${currentShift.expectedCash.toFixed(2)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => { setTxType('drop'); setView('transaction'); }}
                  className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-gray-400 transition-colors"
                >
                  <ArrowDown size={24} className="mb-2 text-blue-500" />
                  <span className="font-bold text-sm">{TRANSLATIONS.safeDrop[lang]}</span>
                </button>
                <button 
                  onClick={() => { setTxType('payout'); setView('transaction'); }}
                  className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-gray-400 transition-colors"
                >
                  <ArrowUp size={24} className="mb-2 text-orange-500" />
                  <span className="font-bold text-sm">{TRANSLATIONS.payout[lang]}</span>
                </button>
                 <button 
                  onClick={() => setView('close')}
                  className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/50 rounded-2xl hover:border-red-300 transition-colors text-red-700 dark:text-red-400"
                >
                  <FileText size={24} className="mb-2" />
                  <span className="font-bold text-sm">{TRANSLATIONS.closeShift[lang]}</span>
                </button>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                 <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Recent Transactions</h4>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                    {currentShift.transactions.slice().reverse().map(tx => (
                      <div key={tx.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${tx.type === 'sale' ? 'bg-green-500' : tx.type === 'refund' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                           <span className="capitalize font-medium">{tx.type}</span>
                           <span className="text-gray-400 text-xs"> - {tx.reason}</span>
                        </div>
                        <div className="font-mono">
                           {['drop', 'payout', 'refund'].includes(tx.type) ? '-' : '+'}${tx.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* VIEW: TRANSACTION (Drop/Payout) */}
          {view === 'transaction' && (
             <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bold mb-2 capitalize">{txType === 'drop' ? TRANSLATIONS.safeDrop[lang] : TRANSLATIONS.payout[lang]}</h3>
              
              <input 
                type="text"
                placeholder={TRANSLATIONS.reason[lang]}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full max-w-xs mb-4 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-lumina-500"
              />

              <div className="text-5xl font-mono font-black mb-8 border-b-2 border-red-500 pb-2 w-full text-center text-red-500">
                -${amount || '0.00'}
              </div>

              <Keypad 
                onEnter={handleTransaction} 
                enterLabel="Confirm" 
                onNumInput={handleNumInput} 
                onBackspace={handleBackspace} 
                amount={amount}
              />
              <button onClick={() => setView('dashboard')} className="mt-4 text-gray-500 hover:underline">Cancel</button>
            </div>
          )}

           {/* VIEW: CLOSE SHIFT (Z-Report) */}
           {view === 'close' && currentShift && (
             <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bold mb-2">{TRANSLATIONS.zReport[lang]}</h3>
              <p className="text-gray-500 mb-6">Count the money in the drawer.</p>
              
              <div className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 flex justify-between items-center">
                 <span className="font-bold text-gray-500">{TRANSLATIONS.expectedCash[lang]}</span>
                 <span className="font-mono text-2xl font-bold">${currentShift.expectedCash.toFixed(2)}</span>
              </div>

              <div className="text-5xl font-mono font-black mb-2 w-full text-center">
                ${amount || '0.00'}
              </div>
              <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest">{TRANSLATIONS.actualCash[lang]}</p>

              {amount && (
                <div className={`flex items-center gap-2 mb-6 font-bold px-4 py-2 rounded-lg ${Math.abs(parseFloat(amount) - currentShift.expectedCash) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {Math.abs(parseFloat(amount) - currentShift.expectedCash) < 0.01 ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                   Variance: ${(parseFloat(amount) - currentShift.expectedCash).toFixed(2)}
                </div>
              )}

              <Keypad 
                onEnter={handleCloseShift} 
                enterLabel="Finalize & Close" 
                onNumInput={handleNumInput} 
                onBackspace={handleBackspace} 
                amount={amount}
              />
              <button onClick={() => setView('dashboard')} className="mt-4 text-gray-500 hover:underline">Cancel</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};