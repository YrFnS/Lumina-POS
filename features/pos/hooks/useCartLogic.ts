
import { useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Discount } from '../../../types';

export const useCartLogic = (playSound: (type: 'beep' | 'error' | 'click') => void) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState<Discount | undefined>(undefined);
  const [isRefundMode, setIsRefundMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, selectedVariants: ProductVariant[] = [], note?: string) => {
    if (product.stock <= 0) { playSound('error'); return; }
    playSound('beep');
    const cartItemId = `${product.id}-${selectedVariants.map(v => v.id).sort().join('-')}-${note || ''}`;
    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        if (existing.quantity >= product.stock) { playSound('error'); return prev; }
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { cartItemId, product, quantity: 1, selectedVariants, note }];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
    playSound('click');
  };

  const updateCartItemDiscount = (cartItemId: string, discount?: Discount) => {
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, discount } : item));
    playSound('click');
  };

  const updateCartItemNote = (cartItemId: string, note: string) => {
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, note } : item));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    playSound('click');
  };

  const clearCart = () => {
    setCart([]);
    setIsRefundMode(false);
    setGlobalDiscount(undefined);
    playSound('click');
  };

  const toggleRefundMode = () => {
    setIsRefundMode(prev => !prev);
    playSound('click');
  };

  return {
    cart, setCart,
    globalDiscount, setGlobalDiscount,
    isRefundMode, toggleRefundMode,
    addToCart, updateQuantity, updateCartItemDiscount, updateCartItemNote, removeFromCart, clearCart
  };
};
