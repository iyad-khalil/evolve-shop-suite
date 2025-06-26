
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variant?: ProductVariant) => void;
  updateQuantity: (productId: string, quantity: number, variant?: ProductVariant) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && 
        item.variant?.id === variant?.id
      );

      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id && item.variant?.id === variant?.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { product, quantity, variant }];
    });
  };

  const removeFromCart = (productId: string, variant?: ProductVariant) => {
    setItems(prev => prev.filter(item => 
      !(item.product.id === productId && item.variant?.id === variant?.id)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, variant?: ProductVariant) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.product.id === productId && item.variant?.id === variant?.id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
