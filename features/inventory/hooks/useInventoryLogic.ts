import { useState, useEffect } from 'react';
import { Product, Supplier, Category, StockMovement } from '../../../types';
import { MOCK_PRODUCTS, MOCK_SUPPLIERS, MOCK_CATEGORIES } from '../../../constants';

export const useInventoryLogic = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    const load = (key: string, setter: any, def: any) => {
      const saved = localStorage.getItem(key);
      if (saved) setter(JSON.parse(saved));
      else setter(def);
    };

    load('lumina_products', setProducts, MOCK_PRODUCTS);
    load('lumina_suppliers', setSuppliers, MOCK_SUPPLIERS);
    load('lumina_categories', setCategories, MOCK_CATEGORIES);
    load('lumina_movements', setStockMovements, []);
  }, []);

  useEffect(() => { localStorage.setItem('lumina_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('lumina_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('lumina_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('lumina_movements', JSON.stringify(stockMovements)); }, [stockMovements]);

  // Supplier Actions
  const addSupplier = (s: Supplier) => setSuppliers(prev => [...prev, s]);
  const updateSupplier = (s: Supplier) => setSuppliers(prev => prev.map(item => item.id === s.id ? s : item));
  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

  // Category Actions
  const addCategory = (c: Category) => setCategories(prev => [...prev, c]);
  const updateCategory = (c: Category) => setCategories(prev => prev.map(item => item.id === c.id ? c : item));
  const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));

  // Product Actions
  const addProduct = (product: Product) => setProducts(prev => [...prev, product]);
  const editProduct = (product: Product) => setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const updateProductStock = (id: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const diff = newStock - p.stock;
        if (diff !== 0) {
          const movement: StockMovement = {
            id: Date.now().toString(),
            productId: p.id,
            productName: p.name,
            quantity: diff,
            type: diff > 0 ? 'restock' : 'adjustment',
            reason: 'Manual Adjustment',
            timestamp: Date.now()
          };
          setStockMovements(prevSm => [movement, ...prevSm]);
        }
        return { ...p, stock: Math.max(0, newStock) };
      }
      return p;
    }));
  };

  return {
    products, suppliers, categories, stockMovements,
    setProducts, setStockMovements, // Exposed for checkout
    addSupplier, updateSupplier, deleteSupplier,
    addCategory, updateCategory, deleteCategory,
    addProduct, editProduct, deleteProduct, updateProductStock
  };
};