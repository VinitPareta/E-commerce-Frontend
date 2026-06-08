import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiShoppingBag,
  FiStar,
  FiX,
  FiBarChart2,
} from "react-icons/fi";
import {
  formatPrice,
  getEffectivePrice,
  calcDiscountPercent,
  buildImageUrl,
} from "../utils/helpers";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import PriceComparison from "./PriceComparison";

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const [showComparison, setShowComparison] = useState(false);
  const [showDiscountTip, setShowDiscountTip] = useState(false);
  const [showFeaturedTip, setShowFeaturedTip] = useState(false);

  const discount = calcDiscountPercent(product);
  const inWishlist = isInWishlist(product._id);
  const outOfStock = !product.inStock || product.stock <= 0;
  const reviewCount = product.numReviews ?? product.reviews?.length ?? 0;
  const rating = product.rating ?? 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group relative rounded-2xl bg-white shadow-card dark:bg-brand-black-soft"
      >
        {/* ── Badges sit on the CARD (not inside image overflow-hidden) ── */}

        {/* Discount Badge */}
        {discount > 0 && (
          <div
            className="absolute left-3 top-3 z-30"
            onMouseEnter={() => setShowDiscountTip(true)}
            onMouseLeave={() => setShowDiscountTip(false)}
          >
            <span className="badge bg-brand-green text-white shadow-lg select-none">
              -{discount}%
            </span>

            <AnimatePresence>
              {showDiscountTip && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-56 rounded-xl bg-slate-900 p-3 text-xs text-white shadow-2xl"
                  style={{ zIndex: 9999 }}
                >
                  <p className="font-semibold text-brand-green">
                    🎉 {discount}% Discount
                  </p>
                  <p className="mt-1 leading-relaxed text-gray-300">
                    This product is {discount}% cheaper than its original price.
                  </p>
                  <p className="mt-1 text-gray-300">
                    You save{" "}
                    <span className="font-semibold text-white">
                      {formatPrice(product.price - getEffectivePrice(product))}
                    </span>
                  </p>
                  {/* little arrow */}
                  <div className="absolute -top-1.5 left-4 h-3 w-3 rotate-45 rounded-sm bg-slate-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/*Featured Badge */}
        {product.isFeatured && !outOfStock && (
          <div
            className="absolute right-3 top-3 z-30"
            onMouseEnter={() => setShowFeaturedTip(true)}
            onMouseLeave={() => setShowFeaturedTip(false)}
          >
            <span className="badge bg-white text-brand-green shadow select-none">
              Featured
            </span>

            <AnimatePresence>
              {showFeaturedTip && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 rounded-xl bg-slate-900 p-3 text-xs text-white shadow-2xl"
                  style={{ width: "190px", zIndex: 9999 }}
                >
                  <p className="font-semibold text-yellow-400">
                    ⭐ Featured Product
                  </p>
                  <p className="mt-1 leading-relaxed text-gray-300">
                    Highlighted because it is popular, highly rated, or
                    specially selected by our team.
                  </p>
                  {/* little arrow */}
                  <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 rounded-sm bg-slate-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Product Image */}
        <Link to={`/product/${product._id}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-brand-green-soft dark:bg-brand-black">
            <img
              src={buildImageUrl(product.images?.[0])}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/600x600/FFE0EC/D63A75?text=DS+Store";
              }}
            />
          </div>
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(product._id);
          }}
          aria-label="Toggle wishlist"
          className={`absolute right-3 top-1/2 -translate-y-12 rounded-full bg-white/90 p-2.5 opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-brand-green hover:text-white group-hover:translate-y-0 group-hover:opacity-100 dark:bg-brand-black/80 ${
            inWishlist ? "!opacity-100 !translate-y-0 text-brand-green" : ""
          }`}
        >
          <FiHeart className={inWishlist ? "fill-brand-green" : ""} />
        </button>

        <div className="space-y-2 p-4">
          <p className="text-xs uppercase tracking-wide text-brand-green">
            {product.category}
          </p>

          <Link to={`/product/${product._id}`}>
            <h3 className="line-clamp-1 font-semibold text-gray-900 transition group-hover:text-brand-green dark:text-white">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FiStar className="fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
            {reviewCount > 0 && <span>({reviewCount})</span>}
          </div>

          <div className="flex items-center justify-between pt-1">
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

            {outOfStock ? (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-semibold text-red-600">
                Sold Out
              </span>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product._id, 1)}
                aria-label="Add to cart"
                className="rounded-full bg-brand-green p-2.5 text-white shadow-soft transition hover:bg-brand-green-dark"
              >
                <FiShoppingBag />
              </button>
            )}
          </div>

          {/* Compare Prices Button */}
          <button
            type="button"
            onClick={() => setShowComparison(true)}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-1.5 text-xs font-medium text-gray-500 transition hover:border-brand-green hover:text-brand-green dark:border-white/10 dark:text-gray-400"
          >
            <FiBarChart2 size={12} />
            Compare Prices
          </button>
        </div>
      </motion.div>

      {/* Price Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-brand-black-soft"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-brand-black-soft">
                <div className="flex items-center gap-3">
                  {product.images?.[0] && (
                    <img
                      src={buildImageUrl(product.images[0])}
                      alt={product.name}
                      className="h-10 w-10 rounded-xl object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <h3 className="line-clamp-1 text-sm font-semibold">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Price comparison across stores
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowComparison(false)}
                  className="rounded-xl p-2 transition hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="p-4">
                <PriceComparison
                  productId={product._id}
                  ourPrice={getEffectivePrice(product)}
                  autoExpand={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;
