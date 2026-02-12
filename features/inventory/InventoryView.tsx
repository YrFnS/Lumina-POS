import React, { useState } from 'react';
import { Search, Package, AlertTriangle, Minus, Plus, Edit2, Trash2, PlusCircle, Users, Layers, History, TrendingUp } from 'lucide-react';
import { TRANSLATIONS } from '../../constants';
import { useStore } from '../../context/StoreContext';
import { Button } from '../../components/ui/Button';
import { ProductFormModal } from './components/ProductFormModal';
import { SupplierFormModal } from './components/SupplierFormModal';
import { CategoryFormModal } from './components/CategoryFormModal';
import { Product, Supplier, Category } from '../../types';

export const InventoryView: React.FC = () => {
  const { products, suppliers, categories, stockMovements, lang, updateProductStock, deleteProduct, deleteSupplier, deleteCategory } = useStore();
  const [tab, setTab] = useState<'products' | 'suppliers' | 'categories' | 'history'>('products');
  const [search, setSearch] = useState('');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.nameAr.includes(search) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const calculateMargin = (price: number, cost: number) => {
    return price > 0 ? ((price - cost) / price * 100).toFixed(1) : '0.0';
  };

  const handleEditProduct = (p: Product) => { setEditingProduct(p); setIsProductModalOpen(true); };
  const handleEditSupplier = (s: Supplier) => { setEditingSupplier(s); setIsSupplierModalOpen(true); };
  const handleEditCategory = (c: Category) => { setEditingCategory(c); setIsCategoryModalOpen(true); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-black font-sans">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-black italic flex items-center gap-2">
          <Package className="text-lumina-500" /> {TRANSLATIONS.inventory[lang]}
        </h2>
        
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
           <button onClick={() => setTab('products')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${tab === 'products' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>{TRANSLATIONS.products[lang]}</button>
           <button onClick={() => setTab('suppliers')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${tab === 'suppliers' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>{TRANSLATIONS.suppliers[lang]}</button>
           <button onClick={() => setTab('categories')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${tab === 'categories' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>{TRANSLATIONS.categories[lang]}</button>
           <button onClick={() => setTab('history')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${tab === 'history' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>{TRANSLATIONS.history[lang]}</button>
        </div>
      </div>

      {/* Sub-Header Actions */}
      <div className="px-6 py-4 flex justify-between items-center">
         <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder={TRANSLATIONS.searchPlaceholder[lang]}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-lumina-500"
            />
         </div>
         
         {tab === 'products' && (
           <Button size="sm" onClick={() => { setEditingProduct(undefined); setIsProductModalOpen(true); }} className="rounded-lg">
             <PlusCircle size={16} className="mr-2" /> {TRANSLATIONS.addProduct[lang]}
           </Button>
         )}
         {tab === 'suppliers' && (
           <Button size="sm" onClick={() => { setEditingSupplier(undefined); setIsSupplierModalOpen(true); }} className="rounded-lg">
             <PlusCircle size={16} className="mr-2" /> {TRANSLATIONS.addSupplier[lang]}
           </Button>
         )}
         {tab === 'categories' && (
           <Button size="sm" onClick={() => { setEditingCategory(undefined); setIsCategoryModalOpen(true); }} className="rounded-lg">
             <PlusCircle size={16} className="mr-2" /> {TRANSLATIONS.addCategory[lang]}
           </Button>
         )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        
        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800">
                  <th className="p-4">{TRANSLATIONS.item[lang]}</th>
                  <th className="p-4 hidden md:table-cell">SKU</th>
                  <th className="p-4 text-center">{TRANSLATIONS.stock[lang]}</th>
                  <th className="p-4 text-right hidden md:table-cell">{TRANSLATIONS.cost[lang]}</th>
                  <th className="p-4 text-right">{TRANSLATIONS.price[lang]}</th>
                  <th className="p-4 text-right hidden lg:table-cell">{TRANSLATIONS.margin[lang]}</th>
                  <th className="p-4 text-center">{TRANSLATIONS.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredProducts.map(product => {
                  const isLow = product.stock <= product.minStock;
                  const margin = calculateMargin(product.price, product.costPrice);
                  const catName = categories.find(c => c.id === product.categoryId)?.name || product.category;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: product.color }}></div>
                         <div>
                           <div className="font-bold text-sm">{lang === 'en' ? product.name : product.nameAr}</div>
                           <div className="text-xs text-gray-400">{catName}</div>
                         </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-gray-500 hidden md:table-cell">{product.sku}</td>
                      <td className="p-4 text-center">
                         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono border ${isLow ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50'}`}>
                            {isLow && <AlertTriangle size={10} />}
                            {product.stock}
                         </div>
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-gray-500 hidden md:table-cell">${product.costPrice.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-sm font-bold">${product.price.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-sm hidden lg:table-cell">
                         <span className={Number(margin) > 50 ? 'text-green-600' : 'text-gray-500'}>{margin}%</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center mr-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                             <button onClick={() => updateProductStock(product.id, product.stock - 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700"><Minus size={14}/></button>
                             <button onClick={() => updateProductStock(product.id, product.stock + 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700"><Plus size={14}/></button>
                          </div>
                          <button onClick={() => handleEditProduct(product)} className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={() => { if(confirm(TRANSLATIONS.confirmDelete[lang])) deleteProduct(product.id); }} className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SUPPLIERS TAB */}
        {tab === 'suppliers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map(s => (
              <div key={s.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:border-lumina-500 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{s.name}</h3>
                      <p className="text-xs text-gray-500">{s.contactName}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditSupplier(s)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={16}/></button>
                    <button onClick={() => { if(confirm('Delete Supplier?')) deleteSupplier(s.id); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>{s.phone}</div>
                  <div>{s.email}</div>
                  <div className="truncate text-xs text-gray-400 mt-2">{s.address}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORIES TAB */}
        {tab === 'categories' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm max-w-3xl mx-auto">
             <table className="w-full text-left">
               <thead className="bg-gray-50 dark:bg-gray-950 text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-800">
                 <tr>
                   <th className="p-4">Name (EN)</th>
                   <th className="p-4 text-right">Name (AR)</th>
                   <th className="p-4 text-center">Products</th>
                   <th className="p-4 text-center">{TRANSLATIONS.actions[lang]}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                 {categories.map(c => {
                   const count = products.filter(p => p.categoryId === c.id).length;
                   return (
                     <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                       <td className="p-4 font-bold">{c.name}</td>
                       <td className="p-4 text-right font-medium">{c.nameAr}</td>
                       <td className="p-4 text-center">
                         <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-bold">{count}</span>
                       </td>
                       <td className="p-4 text-center">
                         <div className="flex justify-center gap-2">
                           <button onClick={() => handleEditCategory(c)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={16}/></button>
                           <button onClick={() => { if(confirm('Delete Category?')) deleteCategory(c.id); }} disabled={count > 0} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-30"><Trash2 size={16}/></button>
                         </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 dark:bg-gray-950 text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-800">
                 <tr>
                   <th className="p-4">Time</th>
                   <th className="p-4">Product</th>
                   <th className="p-4">Type</th>
                   <th className="p-4 text-right">Change</th>
                   <th className="p-4">Reason</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                 {stockMovements.slice(0, 100).map(m => (
                   <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                     <td className="p-4 text-gray-500">{new Date(m.timestamp).toLocaleString()}</td>
                     <td className="p-4 font-bold">{m.productName}</td>
                     <td className="p-4">
                       <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                         m.type === 'sale' ? 'bg-blue-100 text-blue-700' :
                         m.type === 'restock' ? 'bg-green-100 text-green-700' :
                         m.type === 'return' ? 'bg-purple-100 text-purple-700' :
                         'bg-orange-100 text-orange-700'
                       }`}>
                         {TRANSLATIONS[m.type] ? TRANSLATIONS[m.type][lang] : m.type}
                       </span>
                     </td>
                     <td className={`p-4 text-right font-mono font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {m.quantity > 0 ? '+' : ''}{m.quantity}
                     </td>
                     <td className="p-4 text-gray-500 italic">{m.reason}</td>
                   </tr>
                 ))}
                 {stockMovements.length === 0 && (
                   <tr>
                     <td colSpan={5} className="p-10 text-center text-gray-400">No stock movements recorded.</td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
        )}

      </div>

      <ProductFormModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} product={editingProduct} />
      <SupplierFormModal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} supplier={editingSupplier} />
      <CategoryFormModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} category={editingCategory} />
    </div>
  );
};