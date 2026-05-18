import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getEffectivePrice, buildImageUrl } from '../utils/helpers';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, updateItem, removeItem, totals, loading } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="container-app py-20 text-center">
        <FiShoppingBag className="mx-auto text-6xl text-brand-pink" />
        <h2 className="mt-4 heading text-2xl">Login to view your cart</h2>
        <Link to="/login" className="btn-primary mt-5 inline-flex">
          Login
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0 && !loading) {
    return (
      <div className="container-app py-20 text-center">
        <FiShoppingBag className="mx-auto text-6xl text-brand-pink" />
        <h2 className="mt-4 heading text-2xl">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">
          Looks like you haven't added anything yet
        </p>
        <Link to="/shop" className="btn-primary mt-5 inline-flex">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="heading">Your Cart</h1>
      <p className="mt-1 text-sm text-gray-500">
        {totals.count} item{totals.count !== 1 && 's'} in cart
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <AnimatePresence>
            {cart.items.map((item) => {
              if (!item.product) return null;
              const price = getEffectivePrice(item.product);
              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="card-glass flex gap-4 p-4"
                >
                  <Link
                    to={`/product/${item.product._id}`}
                    className="block h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-brand-pink-soft dark:bg-brand-black"
                  >
                    <img
                      src={buildImageUrl(item.product.images?.[0])}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link
                          to={`/product/${item.product._id}`}
                          className="font-semibold hover:text-brand-pink"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {item.size && <>Size: {item.size}</>}
                          {item.size && item.color && ' • '}
                          {item.color && <>Color: {item.color}</>}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="rounded-full p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                        aria-label="Remove"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                      <div className="flex items-center rounded-full border-2 border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() =>
                            updateItem(item._id, item.quantity - 1)
                          }
                          className="p-1.5"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItem(item._id, item.quantity + 1)
                          }
                          className="p-1.5"
                        >
                          <FiPlus />
                        </button>
                      </div>
                      <p className="text-lg font-bold text-brand-pink">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <aside className="self-start lg:sticky lg:top-24">
          <div className="card-glass p-6">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">
                  {formatPrice(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold">
                  {totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span className="font-semibold">{formatPrice(totals.tax)}</span>
              </div>
              <div className="my-3 border-t border-dashed border-gray-300 dark:border-gray-600" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-brand-pink">
                  {formatPrice(totals.total)}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary mt-5 w-full"
            >
              Proceed to Checkout <FiArrowRight />
            </button>
            <Link
              to="/shop"
              className="mt-3 block text-center text-sm text-brand-pink hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
