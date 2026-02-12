import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { TRANSLATIONS } from '../../constants';
import { useStore } from '../../context/StoreContext';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, lang } = useStore();
  
  return (
    <div className={`
      flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300
      ${isOnline 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse'}
    `}>
      {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
      <span>{isOnline ? TRANSLATIONS.online[lang] : TRANSLATIONS.offline[lang]}</span>
    </div>
  );
};