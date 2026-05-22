import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { wishlist, loading } = useWishlist();

  if (!isAuthenticated) {
    return (
      <div className="container-app py-20 text-center">
        <FiHeart className="mx-auto text-6xl text-brand-green" />
        <h2 className="mt-4 heading text-2xl">Login to view your wishlist</h2>
        <Link to="/login" className="btn-primary mt-5 inline-flex">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="heading">Your Wishlist</h1>
      <p className="mt-1 text-sm text-gray-500">
        {wishlist?.products?.length || 0} item
        {wishlist?.products?.length !== 1 && 's'} saved
      </p>

      {loading ? (
        <p className="mt-8 text-center text-gray-500">Loading…</p>
      ) : wishlist?.products?.length === 0 ? (
        <div className="mt-12 text-center">
          <FiHeart className="mx-auto text-6xl text-brand-green" />
          <p className="mt-4 text-lg font-semibold">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-gray-500">
            Save products you love for later
          </p>
          <Link to="/shop" className="btn-primary mt-5 inline-flex">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlist.products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
