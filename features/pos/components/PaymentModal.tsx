import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Gift, Wallet, CheckSquare, Printer, Mail } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { PaymentMethod, Payment } from '../../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onComplete: (payments: Payment[], tip: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, total, onComplete }) => {
  const { lang } = useStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tip, setTip] = useState(0);
  const [currentAmount, setCurrentAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [receiptType, setReceiptType] = useState<'print' | 'email' | 'none'>('print');

  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total + tip - paidAmount);

  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setTip(0);
      setCurrentAmount('');
      setSelectedMethod('cash');
    }
  }, [isOpen, total]);

  useEffect(() => {
     if (currentAmount === '' && remaining > 0) {
       setCurrentAmount(remaining.toFixed(2));
     }
  }, [remaining, currentAmount]);

  if (!isOpen) return null;

  const handleNumClick = (num: string) => {
    if (num === '.' && currentAmount.includes('.')) return;
    if (currentAmount === remaining.toFixed(2)) {
      setCurrentAmount(num);
    } else {
      setCurrentAmount(prev => prev + num);
    }
  };

  const addPayment = () => {
    const val = parseFloat(currentAmount);
    if (!val || val <= 0) return;
    
    const newPayment: Payment = {
      id: Date.now().toString(),
      method: selectedMethod,
      amount: val
    };
    
    setPayments([...payments, newPayment]);
    setCurrentAmount('');
  };

  const isComplete = remaining <= 0.01;

  const methods: { id: PaymentMethod; icon: React.ReactNode; label: string }[] = [
    { id: 'cash', icon: <Banknote />, label: TRANSLATIONS.cash[lang] },
    { id: 'card', icon: <CreditCard />, label: TRANSLATIONS.card[lang] },
    { id: 'gift', icon: <Gift />, label: TRANSLATIONS.gift[lang] },
    { id: 'wallet', icon: <Wallet />, label: TRANSLATIONS.wallet[lang] },
    { id: 'check', icon: <CheckSquare />, label: TRANSLATIONS.check[lang] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-black w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-800">
        
        <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-900/50 p-6 border-r border-gray-200 dark:border-gray-800 flex flex-col gap-6">
          <div>
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-3">{TRANSLATIONS.payment[lang]} Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {methods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border-2 ${
                    selectedMethod === m.id 
                      ? 'bg-black text-white border-black dark:bg-lumina-500 dark:text-black dark:border-lumina-500 shadow-lg' 
                      : 'bg-white dark:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  {m.icon}
                  <span className="mt-2 font-bold text-sm">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
             <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-3">{TRANSLATIONS.tip[lang]}</h3>
             <div className="flex gap-2">
               {[0, 5, 10, 15, 20].map(pct => (
                 <button
                   key={pct}
                   onClick={() => setTip(total * (pct / 100))}
                   className={`flex-1 py-2 rounded-lg font-bold text-sm border ${
                     Math.abs(tip - total * (pct/100)) < 0.1
                       ? 'bg-black text-white dark:bg-gray-700 border-black dark:border-gray-600'
                       : 'bg-transparent border-gray-300 dark:border-gray-700'
                   }`}
                 >
                   {pct}%
                 </button>
               ))}
             </div>
          </div>

          <div className="mt-auto">
             <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-3">Receipt</h3>
             <div className="flex gap-2">
                <button onClick={() => setReceiptType('email')} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 border ${receiptType === 'email' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-200 dark:border-gray-700'}`}>
                  <Mail size={18} /> Email
                </button>
                <button onClick={() => setReceiptType('print')} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 border ${receiptType === 'print' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-200 dark:border-gray-700'}`}>
                  <Printer size={18} /> Print
                </button>
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-black relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 z-10">
            <X size={24} />
          </button>

          <div className="p-8 flex-1 flex flex-col justify-center items-center">
             <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-1">
                   <div className="text-gray-500 text-sm font-bold uppercase">{TRANSLATIONS.remaining[lang]}</div>
                   <div className="text-6xl font-black tracking-tighter font-mono">
                     ${remaining.toFixed(2)}
                   </div>
                   <div className="text-sm text-gray-400">
                     Total: ${(total + tip).toFixed(2)} • Paid: ${paidAmount.toFixed(2)}
                   </div>
                </div>

                <div className="flex items-center gap-2 border-b-2 border-gray-100 dark:border-gray-800 pb-2">
                  <span className="text-2xl font-bold text-gray-400">$</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={currentAmount} 
                    className="w-full text-4xl font-bold bg-transparent focus:outline-none font-mono"
                    placeholder="0.00"
                  />
                  <Button size="sm" onClick={() => setCurrentAmount('')} variant="ghost">Clear</Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(n => (
                     <button
                       key={n}
                       onClick={() => handleNumClick(n.toString())}
                       className="h-14 rounded-2xl bg-gray-50 dark:bg-gray-900 text-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                     >
                       {n}
                     </button>
                   ))}
                   <button 
                      onClick={addPayment}
                      disabled={!parseFloat(currentAmount) || remaining <= 0.01}
                      className="h-14 rounded-2xl bg-lumina-500 text-white text-xl font-bold hover:bg-lumina-600 disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-gray-800"
                   >
                     Add
                   </button>
                </div>

                <div className="min-h-[80px] space-y-2">
                  {payments.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2 capitalize font-bold">
                        {p.method === 'cash' ? <Banknote size={16}/> : <CreditCard size={16}/>} 
                        {p.method}
                      </div>
                      <div className="font-mono font-bold">${p.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-800">
            <Button 
              size="lg" 
              className="w-full rounded-2xl text-xl" 
              disabled={!isComplete}
              onClick={() => onComplete(payments, tip)}
            >
              {isComplete ? `${TRANSLATIONS.finalize[lang]} Transaction` : `Pay Remaining $${remaining.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};