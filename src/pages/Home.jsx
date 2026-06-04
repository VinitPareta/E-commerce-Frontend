import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiArrowUp,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeart,
} from "react-icons/fi";
import OutfitCompleteAI from "../components/OutfitCompleteAI";
const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, t] = await Promise.all([
          api.get("/products?featured=true&limit=8"),
          api.get("/products?trending=true&limit=8"),
        ]);
        setFeatured(f.data.products);
        setTrending(t.data.products);
      } catch (err) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  {
    /* ── Scroll To Top Button ── */
  }
  return (
    <div className="overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[600px] w-full">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=80"
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute -bottom-10 -left-20 h-80 w-80 rounded-full bg-brand-green/20 blur-3xl" />

        <div className="container-app relative flex h-full flex-col justify-end pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-brand-green-light">
              New Season Collection 2026
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              Discover{" "}
              <span className="bg-gradient-to-r from-brand-green-light to-brand-green bg-clip-text text-transparent">
                Trendy
              </span>{" "}
              Fashion
            </h1>
            <p className="mt-4 max-w-md text-base text-white/70 md:text-lg">
              Premium quality clothing and accessories curated with love.
              Express yourself with DS Store.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop?category=Men"
                className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-black transition hover:bg-brand-green hover:text-white"
              >
                SHOP MEN'S
              </Link>
              <Link
                to="/shop?category=Women"
                className="rounded-full border-2 border-white/70 px-7 py-3 text-sm font-semibold text-white transition hover:border-brand-green hover:bg-brand-green"
              >
                SHOP WOMEN'S
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-16 right-4 hidden flex-col items-end gap-4 md:flex md:bottom-24 md:right-8"
          >
            {[
              { num: "500+", label: "Products" },
              { num: "10K+", label: "Happy Customers" },
              { num: "4.8★", label: "Rated" },
            ].map((s) => (
              <div key={s.label} className="text-right">
                <p className="text-2xl font-bold text-brand-green">{s.num}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Feature strips ── */}
      <section className="container-app py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              Icon: FiTruck,
              title: "Free Shipping",
              desc: "On orders above ₹1000",
            },
            {
              Icon: FiRefreshCw,
              title: "Easy Returns",
              desc: "7-day return policy",
            },
            {
              Icon: FiShield,
              title: "Secure Payment",
              desc: "100% safe checkout",
            },
            {
              Icon: FiHeart,
              title: "Premium Quality",
              desc: "Curated collections",
            },
          ].map(({ Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-glass flex items-center gap-3 p-4 transition hover:shadow-glow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10 text-xl text-brand-green">
                <Icon />
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <OutfitCompleteAI />

      {/* ── Shop by Category ── */}
      <section className="container-app section">
        <div className="mb-10 text-center">
          <h2 className="heading">Shop by Category</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Find your perfect style across our curated collections
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Men",
              link: "/shop?category=Men",
              img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "Women",
              link: "/shop?category=Women",
              img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "Accessories",
              link: "/shop?category=Accessories",
              img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
            },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={c.link}
                className="group relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-card"
              >
                <img
                  src={c.img}
                  alt={c.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 w-full p-6 text-white">
                  <h3 className="font-display text-3xl font-bold">{c.title}</h3>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm transition group-hover:gap-3">
                    Explore Collection <FiArrowRight />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="container-app section">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="heading">Featured Products</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Handpicked favourites just for you
            </p>
          </div>
          <Link
            to="/shop?featured=true"
            className="hidden text-sm font-semibold text-brand-green hover:underline md:flex md:items-center md:gap-1"
          >
            View All <FiArrowRight />
          </Link>
        </div>
        {loading ? (
          <SkeletonGrid count={8} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Trending Now ── */}
      <section className="relative overflow-hidden py-24 text-white">
        {/* Background image */}
        <img
          src="/dist/assets/trending bg image.jpeg"
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        {/* Green glow blobs */}
        <div className="absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-brand-green/15 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-brand-green/10 blur-3xl" />

        {/* Header */}
        <div className="container-app relative mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-brand-green-light">
              This Week
            </span>
            <h2 className="font-display text-4xl font-bold md:text-5xl lg:text-6xl">
              Trending Now
            </h2>
            <p className="mt-3 text-base text-white/60">
              What everyone is loving this week
            </p>
            {/* Decorative divider */}
            <div className="mx-auto mt-5 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-brand-green/50" />
              <div className="h-2 w-2 rounded-full bg-brand-green" />
              <div className="h-px w-16 bg-brand-green/50" />
            </div>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="container-app relative">
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {trending.slice(0, 8).map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -10, transition: { duration: 0.25 } }}
                  className="relative rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(16,185,129,0.4)] ring-0 hover:ring-2 ring-brand-green/50"
                >
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container-app relative mt-14 text-center"
        >
          <Link
            to="/shop?trending=true"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand-green px-9 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-green hover:shadow-[0_0_35px_rgba(16,185,129,0.5)]"
          >
            View All Trending <FiArrowRight />
          </Link>
        </motion.div>
      </section>
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green shadow-glow hover:scale-110 hover:bg-brand-green-dark transition-all duration-300"
          >
            <FiArrowUp className="text-white text-lg" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
