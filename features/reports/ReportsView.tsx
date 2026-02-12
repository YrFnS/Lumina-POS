import React, { useMemo } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, ShoppingCart, 
  Download, PieChart, AlertTriangle, ArrowUpRight, Package 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { TRANSLATIONS } from '../../constants';
import { Button } from '../../components/ui/Button';

const Card = ({ title, value, icon, subtext, color = "lumina" }: any) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-500`}>
      {icon}
    </div>
    <div className="z-10">
      <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-4xl font-black font-mono tracking-tighter">${value}</div>
    </div>
    <div className="z-10 text-xs font-medium text-gray-400 flex items-center gap-1">
      {subtext}
    </div>
  </div>
);

export const ReportsView: React.FC = () => {
  const { salesHistory, products, lang } = useStore();

  const stats = useMemo(() => {
    const totalSales = salesHistory.reduce((sum, order) => sum + order.total, 0);
    const totalTx = salesHistory.length;
    const avgBasket = totalTx > 0 ? totalSales / totalTx : 0;
    
    const inventoryCost = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
    const potentialRevenue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

    const categorySales: Record<string, number> = {};
    salesHistory.forEach(order => {
      order.items.forEach(item => {
        const cat = item.product.category;
        const total = item.product.price * item.quantity;
        categorySales[cat] = (categorySales[cat] || 0) + total;
      });
    });

    const paymentSales: Record<string, number> = {};
    salesHistory.forEach(order => {
      order.payments.forEach(p => {
        paymentSales[p.method] = (paymentSales[p.method] || 0) + p.amount;
      });
    });

    return { 
      totalSales, totalTx, avgBasket, 
      inventoryCost, potentialRevenue, lowStockCount,
      categorySales, paymentSales
    };
  }, [salesHistory, products]);

  const handleExport = () => {
    const headers = ['Order ID', 'Date', 'Total', 'Items', 'Payment Methods', 'Status'];
    const rows = salesHistory.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleString(),
      o.total.toFixed(2),
      o.items.map(i => `${i.quantity}x ${i.product.name}`).join('; '),
      o.payments.map(p => p.method).join('; '),
      o.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-black font-sans">
      <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-black italic flex items-center gap-2">
          <TrendingUp className="text-lumina-500" /> {TRANSLATIONS.reports[lang]}
        </h2>
        <Button size="sm" onClick={handleExport} variant="secondary">
          <Download size={16} className="mr-2" /> {TRANSLATIONS.exportCsv[lang]}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            title={TRANSLATIONS.totalSales[lang]} 
            value={stats.totalSales.toFixed(2)} 
            icon={<DollarSign size={80} />} 
            subtext={`${stats.totalTx} ${TRANSLATIONS.transactions[lang]}`}
          />
          <Card 
            title={TRANSLATIONS.avgBasket[lang]} 
            value={stats.avgBasket.toFixed(2)} 
            icon={<ShoppingCart size={80} />} 
            subtext="Per Transaction"
            color="purple"
          />
           <Card 
            title={TRANSLATIONS.inventoryValue[lang]} 
            value={stats.inventoryCost.toFixed(2)} 
            icon={<Package size={80} />} 
            subtext={`Cost Basis`}
            color="blue"
          />
           <Card 
            title={TRANSLATIONS.potentialRevenue[lang]} 
            value={stats.potentialRevenue.toFixed(2)} 
            icon={<ArrowUpRight size={80} />} 
            subtext="Retail Value"
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-2 mb-6">
               <PieChart size={20} className="text-lumina-500" />
               <h3 className="font-bold text-lg">{TRANSLATIONS.byCategory[lang]}</h3>
             </div>
             {Object.keys(stats.categorySales).length === 0 ? (
               <div className="text-center py-10 text-gray-400">{TRANSLATIONS.noData[lang]}</div>
             ) : (
               <div className="space-y-4">
                 {Object.entries(stats.categorySales).map(([cat, val]) => (
                   <div key={cat}>
                     <div className="flex justify-between text-sm mb-1 font-bold">
                       <span>{cat}</span>
                       <span>${(val as number).toFixed(2)}</span>
                     </div>
                     <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-lumina-500" 
                         style={{ width: `${((val as number) / stats.totalSales) * 100}%` }} 
                       />
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-2 mb-6">
               <BarChart3 size={20} className="text-purple-500" />
               <h3 className="font-bold text-lg">{TRANSLATIONS.byPayment[lang]}</h3>
             </div>
             {Object.keys(stats.paymentSales).length === 0 ? (
               <div className="text-center py-10 text-gray-400">{TRANSLATIONS.noData[lang]}</div>
             ) : (
               <div className="space-y-4">
                 {Object.entries(stats.paymentSales).map(([method, val]) => (
                   <div key={method}>
                     <div className="flex justify-between text-sm mb-1 font-bold capitalize">
                       <span>{method}</span>
                       <span>${(val as number).toFixed(2)}</span>
                     </div>
                     <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-purple-500" 
                         style={{ width: `${((val as number) / stats.totalSales) * 100}%` }} 
                       />
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {stats.lowStockCount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-6 flex items-start gap-4">
            <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full text-red-600 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-red-900 dark:text-red-100">{TRANSLATIONS.lowStockItems[lang]}</h3>
              <p className="text-red-700 dark:text-red-300 mt-1">
                You have {stats.lowStockCount} items below minimum stock levels. Check inventory to restock.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};