import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeart } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonCard';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, t] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products?trending=true&limit=8'),
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

  return (
    <div className="overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-pink-soft via-white to-brand-pink-soft dark:from-brand-black-soft dark:via-brand-black dark:to-brand-black-soft" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-pink/30 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-brand-pink-light/40 blur-3xl" />

        <div className="container-app relative grid gap-8 py-16 md:grid-cols-2 md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center"
          >
            <span className="badge mb-4 w-fit bg-brand-pink/10 text-brand-pink">
              New Season Collection 2026
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-7xl">
              Discover{' '}
              <span className="bg-gradient-to-r from-brand-pink to-brand-pink-dark bg-clip-text text-transparent">
                Trendy
              </span>{' '}
              Fashion <br />
              for Boys & Girls
            </h1>
            <p className="mt-5 max-w-md text-lg text-gray-600 dark:text-gray-300">
              Premium quality clothing and accessories curated with love.
              Express yourself with DS Store.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/shop?trending=true" className="btn-outline">
                View Trending
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { num: '500+', label: 'Products' },
                { num: '10K+', label: 'Happy Customers' },
                { num: '4.8★', label: 'Rated' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-brand-pink md:text-3xl">
                    {s.num}
                  </p>
                  <p className="text-xs text-gray-500 md:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="card-glass aspect-[3/4] w-72 overflow-hidden md:w-96"
              >
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
                  alt="Hero fashion"
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -left-10 -top-6 hidden h-32 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-xl md:block"
              >
                <img
                  src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-6 -right-8 hidden h-40 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-xl md:block"
              >
                <img
                  src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-app -mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { Icon: FiTruck, title: 'Free Shipping', desc: 'On orders above ₹1000' },
          { Icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
          { Icon: FiShield, title: 'Secure Payment', desc: '100% safe checkout' },
          { Icon: FiHeart, title: 'Premium Quality', desc: 'Curated collections' },
        ].map(({ Icon, title, desc }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-glass flex items-center gap-3 p-4 transition hover:shadow-glow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-pink/10 text-xl text-brand-pink">
              <Icon />
            </div>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

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
              title: 'Men',
              link: '/shop?category=Men',
              img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
            },
            {
              title: 'Women',
              link: '/shop?category=Women',
              img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
            },
            {
              title: 'Accessories',
              link: '/shop?category=Accessories',
              img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
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
            className="hidden text-sm font-semibold text-brand-pink hover:underline md:flex md:items-center md:gap-1"
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

      <section className="bg-gradient-to-br from-brand-pink to-brand-pink-dark py-16 text-white">
        <div className="container-app text-center">
          <h2 className="heading">Trending Now</h2>
          <p className="mt-2 text-pink-100">What everyone is loving this week</p>
        </div>
        <div className="container-app mt-10">
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {trending.slice(0, 8).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
