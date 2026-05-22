import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import {
  formatPrice,
  getEffectivePrice,
  calcDiscountPercent,
  buildImageUrl,
} from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { toggle, isInWishlist } = useWishlist();

  const discount = calcDiscountPercent(product);
  const inWishlist = isInWishlist(product._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-card dark:bg-brand-black-soft"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-brand-green-soft dark:bg-brand-black">
          <img
            src={buildImageUrl(product.images?.[0])}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src =
                'https://placehold.co/600x600/FFE0EC/D63A75?text=DS+Store';
            }}
          />

          {discount > 0 && (
            <span className="badge absolute left-3 top-3 bg-brand-green text-white shadow-lg">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="badge absolute right-3 top-3 bg-brand-black text-white">
              Out of Stock
            </span>
          )}
          {product.isFeatured && product.inStock && (
            <span className="badge absolute right-3 top-3 bg-white text-brand-green shadow">
              Featured
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(product._id);
        }}
        aria-label="Toggle wishlist"
        className={`absolute right-3 top-1/2 -translate-y-12 rounded-full bg-white/90 p-2.5 opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-brand-green hover:text-white group-hover:translate-y-0 group-hover:opacity-100 dark:bg-brand-black/80 ${
          inWishlist ? '!opacity-100 !translate-y-0 text-brand-green' : ''
        }`}
      >
        <FiHeart className={inWishlist ? 'fill-brand-green' : ''} />
      </button>

      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-brand-green">
          {product.category}
        </p>
        <Link to={`/product/${product._id}`}>
          <h3 className="line-clamp-1 font-semibold transition group-hover:text-brand-green">
            {product.name}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FiStar className="fill-yellow-400 text-yellow-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span>({product.numReviews})</span>
          </div>
        )}

        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="text-lg font-bold text-brand-green">
              {formatPrice(getEffectivePrice(product))}
            </p>
            {discount > 0 && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => addToCart(product._id, 1)}
            disabled={!product.inStock}
            aria-label="Add to cart"
            className="rounded-full bg-brand-green p-2.5 text-white shadow-soft transition hover:bg-brand-green-dark disabled:opacity-40"
          >
            <FiShoppingBag />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
