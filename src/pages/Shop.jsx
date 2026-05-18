import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import Pagination from '../components/Pagination';

const categories = ['All', 'Men', 'Women', 'Accessories', 'Kids'];
const sorts = [
  { value: '', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(
    () => ({
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') || '',
      sort: searchParams.get('sort') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      inStock: searchParams.get('inStock') || '',
      featured: searchParams.get('featured') || '',
      trending: searchParams.get('trending') || '',
      page: Number(searchParams.get('page') || 1),
    }),
    [searchParams]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== '' && v !== null && v !== undefined) params.set(k, v);
        });
        params.set('limit', 12);
        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data.products);
        setPages(data.pages);
        setTotal(data.total);
      } catch (err) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 font-semibold">Category</h4>
        <div className="space-y-2">
          {categories.map((c) => (
            <label
              key={c}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="category"
                checked={
                  c === 'All' ? !filters.category : filters.category === c
                }
                onChange={() => updateParam('category', c === 'All' ? '' : c)}
                className="accent-brand-pink"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-semibold">Price Range (₹)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="input"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-semibold">Availability</h4>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) =>
              updateParam('inStock', e.target.checked ? 'true' : '')
            }
            className="accent-brand-pink"
          />
          In stock only
        </label>
      </div>

      <button onClick={clearAll} className="btn-outline w-full">
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading text-3xl">
            {filters.keyword
              ? `Search: "${filters.keyword}"`
              : filters.category
              ? filters.category
              : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading…' : `${total} products found`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-outline lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            <FiFilter /> Filters
          </button>
          <select
            value={filters.sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input w-44"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
          <div className="card-glass p-5">{FilterPanel}</div>
        </aside>

        <div>
          {loading ? (
            <SkeletonGrid count={9} />
          ) : products.length === 0 ? (
            <div className="card-glass flex flex-col items-center justify-center p-16 text-center">
              <p className="text-2xl">😢</p>
              <p className="mt-3 text-lg font-semibold">No products found</p>
              <p className="text-sm text-gray-500">
                Try adjusting filters or search terms
              </p>
              <button onClick={clearAll} className="btn-primary mt-5">
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 gap-4 sm:grid-cols-3"
            >
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </motion.div>
          )}

          <Pagination
            page={filters.page}
            pages={pages}
            onPageChange={(n) => updateParam('page', n)}
          />
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setFiltersOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="h-full w-80 max-w-full overflow-y-auto bg-white p-6 dark:bg-brand-black"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}>
                  <FiX />
                </button>
              </div>
              {FilterPanel}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
