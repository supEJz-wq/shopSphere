import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const canShop = isAuthenticated && user?.role !== 'seller' && user?.role !== 'admin';
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guards against stale async responses: if a loadCart() is in flight when the
  // user logs out (or a newer loadCart starts), the older response must be
  // dropped — otherwise the cart (and the navbar badge) can come back after
  // logout and show a logged-out user someone else's cart.
  const requestIdRef = useRef(0);

  const loadCart = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      if (requestId !== requestIdRef.current) return; // stale — superseded
      setItems(data.cart.items);
      setSubtotal(data.cart.subtotal);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.response?.data?.message || 'Could not load your cart.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canShop) {
      loadCart();
    } else {
      requestIdRef.current++; // invalidate any in-flight loadCart
      setItems([]);
      setSubtotal(0);
      setError(null);
    }
  }, [canShop, loadCart]);

  const addToCart = useCallback(
    async (productId, quantity) => {
      const data = await cartService.addToCart(productId, quantity);
      await loadCart();
      return data;
    },
    [loadCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      await cartService.updateCartItem(cartItemId, quantity);
      await loadCart();
    },
    [loadCart]
  );

  const removeItem = useCallback(
    async (cartItemId) => {
      await cartService.removeCartItem(cartItemId);
      await loadCart();
    },
    [loadCart]
  );

  const clearCart = useCallback(() => {
    requestIdRef.current++;
    setItems([]);
    setSubtotal(0);
    setError(null);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      subtotal,
      itemCount,
      loading,
      error,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart: loadCart,
    }),
    [items, subtotal, itemCount, loading, error, addToCart, updateQuantity, removeItem, clearCart, loadCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
