import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHeart,
  FiShoppingBag,
  FiMinus,
  FiPlus,
  FiStar,
  FiTruck,
  FiShield,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import api from "../utils/api";
import Loader from "../components/Loader";
import {
  formatPrice,
  getEffectivePrice,
  calcDiscountPercent,
  buildImageUrl,
} from "../utils/helpers";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import PriceComparison from "../components/PriceComparison";
import ProductCard from "../components/ProductCard";

const AUTO_SCROLL_STEP = 1;
const AUTO_SCROLL_INTERVAL = 20;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const carouselRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const autoScrollRef = useRef(null);
  const isHoveringCarousel = useRef(false);
  const isResettingRef = useRef(false);
  const resumeTimerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        setSize(data.product.sizes?.[0] || "");
        setColor(data.product.colors?.[0] || "");
        setActiveImg(0);

        const rel = await api.get(
          `/products?category=${data.product.category}&limit=50`,
        );
        const list = rel.data.products || rel.data || [];
        setRelated(list.filter((p) => p._id !== data.product._id));
      } catch (err) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Auto-scroll logic
  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  const startAutoScroll = () => {
    if (autoScrollRef.current) return; // already running
    autoScrollRef.current = setInterval(() => {
      const el = carouselRef.current;
      if (!el || isHoveringCarousel.current || isResettingRef.current) return;

      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
      if (atEnd) {
        isResettingRef.current = true;
        el.scrollTo({ left: 0, behavior: "smooth" });
        setTimeout(() => {
          isResettingRef.current = false;
        }, 600);
      } else {
        el.scrollLeft += AUTO_SCROLL_STEP;
      }
      updateScrollState();
    }, AUTO_SCROLL_INTERVAL);
  };

  // Start auto-scroll once related products load; clean up on unmount
  useEffect(() => {
    if (related.length > 0) startAutoScroll();
    return () => {
      stopAutoScroll();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [related]);

  const handleCarouselMouseEnter = () => {
    isHoveringCarousel.current = true;
  };
  const handleCarouselMouseLeave = () => {
    isHoveringCarousel.current = false;
  };

  // Scroll helpers
  const updateScrollState = () => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  // Manual nav: stop auto-scroll, restart it after 2s of inactivity
  const scheduleResume = () => {
    stopAutoScroll();
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      startAutoScroll();
    }, 2000);
  };

  const scrollLeft = () => {
    scheduleResume();
    carouselRef.current?.scrollBy({ left: -320, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  const scrollRight = () => {
    scheduleResume();
    carouselRef.current?.scrollBy({ left: 320, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  if (loading) return <Loader fullScreen />;
  if (!product) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-2xl font-semibold">Product not found</p>
        <Link to="/shop" className="btn-primary mt-4 inline-flex">
          Back to Shop
        </Link>
      </div>
    );
  }

  const discount = calcDiscountPercent(product);
  const inWishlist = isInWishlist(product._id);

  const handleAdd = async () => {
    const ok = await addToCart(product._id, qty, size, color);
    if (ok) navigate("/cart");
  };

  return (
    <div className="container-app py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-green">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-brand-green">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/shop?category=${product.category}`}
          className="hover:text-brand-green"
        >
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-brand-black dark:text-white">{product.name}</span>
      </nav>

      {/* Product Main */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="overflow-hidden rounded-3xl bg-brand-green-soft dark:bg-brand-black-soft">
            <img
              src={buildImageUrl(product.images?.[activeImg])}
              alt={product.name}
              className="aspect-square w-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/600x600/FFE0EC/D63A75?text=DS+Store";
              }}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    i === activeImg
                      ? "border-brand-green"
                      : "border-transparent opacity-70"
                  }`}
                >
                  <img
                    src={buildImageUrl(img)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <p className="text-sm uppercase tracking-wide text-brand-green">
            {product.category} • {product.subCategory}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            {product.name}
          </h1>

          {product.rating > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-yellow-700">
                <FiStar className="fill-yellow-500 text-yellow-500" />
                {product.rating.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({product.numReviews} reviews)
              </span>
            </div>
          )}

          <div className="mt-5 flex items-end gap-3">
            <p className="text-3xl font-bold text-brand-green md:text-4xl">
              {formatPrice(getEffectivePrice(product))}
            </p>
            {discount > 0 && (
              <>
                <p className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </p>
                <span className="badge bg-brand-green/10 text-brand-green">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-gray-600 dark:text-gray-300">
            {product.description}
          </p>

          {product.sizes?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 font-semibold">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[3rem] rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${
                      s === size
                        ? "border-brand-green bg-brand-green text-white"
                        : "border-gray-200 hover:border-brand-green dark:border-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 font-semibold">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${
                      c === color
                        ? "border-brand-green bg-brand-green text-white"
                        : "border-gray-200 hover:border-brand-green dark:border-gray-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <p className="font-semibold">Quantity:</p>
            <div className="flex items-center rounded-full border-2 border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-2.5"
                disabled={qty <= 1}
              >
                <FiMinus />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="p-2.5"
                disabled={qty >= product.stock}
              >
                <FiPlus />
              </button>
            </div>
            <p
              className={`text-sm font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}
            >
              {product.inStock ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="btn-primary flex-1"
            >
              <FiShoppingBag /> Add to Cart
            </button>
            <button
              onClick={() => toggle(product._id)}
              className={`btn ${inWishlist ? "bg-brand-green text-white" : "btn-outline"}`}
              aria-label="Toggle wishlist"
            >
              <FiHeart className={inWishlist ? "fill-white" : ""} />
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 dark:border-white/10">
              <FiTruck className="text-xl text-brand-green" />
              <div>
                <p className="text-sm font-semibold">Free Shipping</p>
                <p className="text-xs text-gray-500">Above ₹1000</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 dark:border-white/10">
              <FiShield className="text-xl text-brand-green" />
              <div>
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="text-xs text-gray-500">100% safe</p>
              </div>
            </div>
          </div>

          <PriceComparison
            productId={product._id}
            ourPrice={getEffectivePrice(product)}
          />
        </motion.div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <section className="mt-16">
          <h2 className="heading text-2xl">Customer Reviews</h2>
          <div className="mt-5 space-y-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="card-glass p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-white">
                    {r.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {Array.from({ length: r.rating }).map((_, n) => (
                        <FiStar key={n} className="fill-yellow-500" />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {r.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="heading text-2xl">More from {product.category}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {related.length} products in this category
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                  canScrollLeft
                    ? "border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                    : "cursor-not-allowed border-gray-200 text-gray-300 dark:border-white/10"
                }`}
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                  canScrollRight
                    ? "border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                    : "cursor-not-allowed border-gray-200 text-gray-300 dark:border-white/10"
                }`}
              >
                <FiChevronRight size={18} />
              </button>

              <Link
                to={`/shop?category=${product.category}`}
                className="hidden items-center gap-1 text-sm font-semibold text-brand-green hover:underline md:flex"
              >
                View All <FiArrowRight />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              ref={carouselRef}
              onScroll={updateScrollState}
              onMouseEnter={handleCarouselMouseEnter}
              onMouseLeave={handleCarouselMouseLeave}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              {related.map((p, i) => (
                <div
                  key={p._id}
                  className="flex-shrink-0 w-[220px] sm:w-[240px]"
                >
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center md:hidden">
            <Link
              to={`/shop?category=${product.category}`}
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-green px-6 py-2.5 text-sm font-semibold text-brand-green hover:bg-brand-green hover:text-white transition"
            >
              View All {product.category} <FiArrowRight />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
