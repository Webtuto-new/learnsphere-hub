import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  type: "class" | "recording" | "bundle";
  title: string;
  price: number;
  currency: string;
  thumbnail_url?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("wt_cart");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("wt_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const itemCount = items.length;
  const isInCart = (id: string) => items.some(i => i.id === id);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount, isInCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
