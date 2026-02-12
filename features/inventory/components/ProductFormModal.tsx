import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Product, ProductVariant } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../../components/ui/Button';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product; // If provided, edit mode
}

const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold uppercase text-gray-500">{label}</label>
    {children}
  </div>
);

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, product }) => {
  const { lang, addProduct, editProduct, categories, suppliers } = useStore();
  const isEdit = !!product;

  // Form State
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    nameAr: '',
    sku: '',
    barcode: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 5,
    category: '',
    categoryId: '',
    supplierId: '',
    color: '#329292',
    variants: []
  });

  const [newVariant, setNewVariant] = useState({ name: '', price: 0 });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData(product);
      } else {
        // Reset for new product
        setFormData({
          id: Date.now().toString(),
          name: '',
          nameAr: '',
          sku: '',
          barcode: '',
          price: 0,
          costPrice: 0,
          stock: 0,
          minStock: 5,
          category: categories[0]?.name || 'Food',
          categoryId: categories[0]?.id || '',
          supplierId: '',
          color: '#329292',
          variants: []
        });
      }
    }
  }, [isOpen, product, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      editProduct(formData);
    } else {
      addProduct({ ...formData, id: Date.now().toString() });
    }
    onClose();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const cat = categories.find(c => c.id === selectedId);
    if (cat) {
      setFormData({ ...formData, categoryId: cat.id, category: cat.name });
    }
  };

  const addVariant = () => {
    if (!newVariant.name) return;
    const variant: ProductVariant = {
      id: Date.now().toString(),
      name: newVariant.name,
      priceModifier: newVariant.price
    };
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), variant]
    }));
    setNewVariant({ name: '', price: 0 });
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== id)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEdit ? TRANSLATIONS.editProduct[lang] : TRANSLATIONS.addProduct[lang]}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label={TRANSLATIONS.nameEn[lang]}>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none"
                />
              </InputGroup>
              <InputGroup label={TRANSLATIONS.nameAr[lang]}>
                <input 
                  required
                  type="text" 
                  value={formData.nameAr}
                  onChange={e => setFormData({...formData, nameAr: e.target.value})}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none text-right"
                  dir="rtl"
                />
              </InputGroup>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InputGroup label={TRANSLATIONS.sku[lang]}>
                <input 
                  required
                  type="text" 
                  value={formData.sku}
                  onChange={e => setFormData({...formData, sku: e.target.value})}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none font-mono"
                />
              </InputGroup>
              <InputGroup label={TRANSLATIONS.barcode[lang]}>
                <input 
                  type="text" 
                  value={formData.barcode || ''}
                  onChange={e => setFormData({...formData, barcode: e.target.value})}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none font-mono"
                />
              </InputGroup>
               <InputGroup label={TRANSLATIONS.category[lang]}>
                <select 
                  value={formData.categoryId || ''}
                  onChange={handleCategoryChange}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none w-full"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {lang === 'en' ? cat.name : cat.nameAr}
                    </option>
                  ))}
                </select>
              </InputGroup>
               <InputGroup label={TRANSLATIONS.color[lang]}>
                <input 
                  type="color" 
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  className="w-full h-12 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer"
                />
              </InputGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <InputGroup label={TRANSLATIONS.suppliers[lang]}>
                  <select 
                    value={formData.supplierId || ''}
                    onChange={e => setFormData({...formData, supplierId: e.target.value})}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none w-full"
                  >
                    <option value="">None</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
               </InputGroup>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <InputGroup label={TRANSLATIONS.price[lang]}>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none font-mono"
                />
              </InputGroup>
              <InputGroup label={TRANSLATIONS.cost[lang]}>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={formData.costPrice}
                  onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value)})}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none font-mono"
                />
              </InputGroup>
              <InputGroup label={TRANSLATIONS.stock[lang]}>
                <input 
                  required
                  type="number" 
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none font-mono"
                />
              </InputGroup>
              <InputGroup label={TRANSLATIONS.minStock[lang]}>
                <input 
                  required
                  type="number" 
                  value={formData.minStock}
                  onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-lumina-500 focus:outline-none font-mono"
                />
              </InputGroup>
            </div>

            {/* Variants */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase text-gray-500">{TRANSLATIONS.variants[lang]}</h3>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Variant Name (e.g., Large)" 
                  value={newVariant.name}
                  onChange={e => setNewVariant({...newVariant, name: e.target.value})}
                  className="flex-[2] p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
                <input 
                  type="number" 
                  placeholder="Price Mod (+)" 
                  value={newVariant.price}
                  onChange={e => setNewVariant({...newVariant, price: parseFloat(e.target.value)})}
                  className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
                <button 
                  type="button" 
                  onClick={addVariant}
                  className="bg-gray-900 text-white dark:bg-lumina-500 dark:text-black px-4 rounded-lg font-bold"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {formData.variants?.map(v => (
                  <div key={v.id} className="flex justify-between items-center bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="font-medium">{v.name}</span>
                    <div className="flex items-center gap-4">
                       <span className="font-mono text-sm text-green-600">+{v.priceModifier.toFixed(2)}</span>
                       <button 
                        type="button" 
                        onClick={() => removeVariant(v.id)} 
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex gap-4">
          <Button variant="secondary" className="flex-1 rounded-xl" onClick={onClose}>
             {TRANSLATIONS.cancel[lang]}
          </Button>
          <Button type="submit" form="product-form" variant="primary" className="flex-1 rounded-xl">
             {TRANSLATIONS.save[lang]}
          </Button>
        </div>

      </div>
    </div>
  );
};