import { useState, useEffect } from 'react';
import { CashShift, CashTransaction } from '../../../types';

export const useShiftLogic = (playSound: (type: 'success' | 'click') => void) => {
  const [currentShift, setCurrentShift] = useState<CashShift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<CashShift[]>([]);

  useEffect(() => {
    const savedCurrent = localStorage.getItem('lumina_current_shift');
    if (savedCurrent) setCurrentShift(JSON.parse(savedCurrent));
    
    const savedHistory = localStorage.getItem('lumina_shift_history');
    if (savedHistory) setShiftHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (currentShift) localStorage.setItem('lumina_current_shift', JSON.stringify(currentShift));
    else localStorage.removeItem('lumina_current_shift');
  }, [currentShift]);

  useEffect(() => {
    localStorage.setItem('lumina_shift_history', JSON.stringify(shiftHistory));
  }, [shiftHistory]);

  const openShift = (floatAmount: number) => {
    if (currentShift) return;
    const newShift: CashShift = {
      id: Date.now().toString(), status: 'open', openedAt: Date.now(), startFloat: floatAmount, expectedCash: floatAmount,
      transactions: [{ id: Date.now().toString(), type: 'float', amount: floatAmount, timestamp: Date.now(), reason: 'Opening Float' }],
      openedBy: 'Admin'
    };
    setCurrentShift(newShift);
    playSound('success');
  };

  const addCashTransaction = (type: 'drop' | 'payout', amount: number, reason: string) => {
    if (!currentShift) return;
    const tx: CashTransaction = { id: Date.now().toString(), type, amount, reason, timestamp: Date.now() };
    setCurrentShift(prev => {
      if (!prev) return null;
      return { ...prev, expectedCash: prev.expectedCash - amount, transactions: [...prev.transactions, tx] };
    });
    playSound('click');
  };

  const closeShift = (actualCash: number) => {
    if (!currentShift) return;
    const closedShift: CashShift = { ...currentShift, status: 'closed', closedAt: Date.now(), actualCash, variance: actualCash - currentShift.expectedCash };
    setShiftHistory(prev => [closedShift, ...prev]);
    setCurrentShift(null);
    playSound('success');
  };

  return {
    currentShift, setCurrentShift, // Exposed for checkout
    shiftHistory,
    openShift, closeShift, addCashTransaction
  };
};