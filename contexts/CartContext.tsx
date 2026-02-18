import React, { createContext, useContext, useState } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product, 
    quantity: number, 
    width?: number, 
    height?: number, 
    price?: number,
    customImage?: string,
    customSpecs?: any
  ) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (
    product: Product, 
    quantity: number, 
    width?: number, 
    height?: number, 
    price?: number,
    customImage?: string,
    customSpecs?: any
  ) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      product_id: product.id,
      product: product,
      quantity,
      custom_width: width,
      custom_height: height,
      calculated_price: price || (product.price_per_m2 * quantity),
      custom_image: customImage,
      custom_specs: customSpecs
    };
    setCart([...cart, newItem]);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.calculated_price, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      cartTotal,
      cartCount: cart.length 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};