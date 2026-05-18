import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist({ products: [] });
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist');
      setWishlist(data.wishlist);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isInWishlist = (productId) =>
    wishlist?.products?.some((p) => (p._id || p) === productId);

  const toggle = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      const { data } = await api.post('/wishlist', { productId });
      setWishlist(data.wishlist);
      toast.success(
        data.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist'
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (productId) => {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      setWishlist(data.wishlist);
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, toggle, remove, isInWishlist, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
