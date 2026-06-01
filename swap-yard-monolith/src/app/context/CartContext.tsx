"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, type: "increase" | "decrease") => void;
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;
  syncCartWithDB: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const initializeCart = async () => {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items)) {
            const mappedItems: CartItem[] = data.items.map((dbItem: any) => ({
              id: dbItem.listing.id,
              title: dbItem.listing.name,
              price: Number(dbItem.listing.price),
              imageUrl: dbItem.listing.images?.[0]?.url || "",
              quantity: dbItem.quantity,
            }));
            setCartItems(mappedItems);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to sync with DB cart", err);
      }

      const storedCart = localStorage.getItem("swapyard_cart");
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (error) {
          console.error("Failed to parse local cart", error);
        }
      }
    };

    initializeCart();
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("swapyard_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const syncItemToDB = async (listingId: string, quantity: number) => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity }),
      });
    } catch (err) {
      console.error("Backend sync failed", err);
    }
  };

  const addToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });

    syncItemToDB(newItem.id, newItem.quantity);
  };

  const removeFromCart = async (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      });
    } catch (err) {
      console.error("Failed to remove item from DB", err);
    }
  };

  const updateQuantity = (id: string, type: "increase" | "decrease") => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty =
          type === "increase" ? item.quantity + 1 : Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQty };
      })
    );

    const current = cartItems.find((item) => item.id === id);
    if (current) {
      const newQty =
        type === "increase" ? current.quantity + 1 : Math.max(1, current.quantity - 1);
      syncItemToDB(id, newQty);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("swapyard_cart");
  };

 const syncCartWithDB = async () => {
  if (cartItems.length === 0) return;

  try {
    await fetch("/api/cart/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems.map((item) => ({
          listingId: item.id,
          quantity: item.quantity,
        })),
      }),
    });
  } catch (err) {
    console.error("Failed to sync local cart to DB", err);
  }
};


  const cartTotal = cartItems.reduce(
    (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const cartCount = cartItems.reduce(
    (count, item) => count + (Number(item.quantity) || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart, syncCartWithDB }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}