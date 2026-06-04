import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { getEffectivePrice } from "../utils/helpers";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = async (productId, quantity = 1, size = "", color = "") => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      return false;
    }
    try {
      const { data } = await api.post("/cart", {
        productId,
        quantity,
        size,
        color,
      });
      setCart(data.cart);
      toast.success("Added to cart");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data.cart);
      toast.success("Item removed");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.delete("/cart");
      setCart(data.cart);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totals = cart.items.reduce(
    (acc, item) => {
      if (!item.product) return acc;
      const price = getEffectivePrice(item.product);
      acc.subtotal += price * item.quantity;
      acc.count += item.quantity;
      return acc;
    },
    { subtotal: 0, count: 0 },
  );
  const shipping = totals.subtotal > 1000 || totals.subtotal === 0 ? 0 : 99;
  const tax = Math.round(totals.subtotal * 0.05);
  const total = totals.subtotal + shipping + tax;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        refresh,
        totals: { ...totals, shipping, tax, total },
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
