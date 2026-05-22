import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatPrice, buildImageUrl } from '../utils/helpers';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 20, page });
      if (search) params.set('keyword', search);
      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <FiPlus /> Add Product
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-5 max-w-md">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-x-auto rounded-2xl bg-white shadow-card dark:bg-brand-black-soft"
        >
          <table className="w-full text-sm">
            <thead className="bg-brand-green-soft text-left text-xs uppercase text-brand-green-dark dark:bg-brand-black">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-gray-100 hover:bg-brand-green-soft/20 dark:border-white/10 dark:hover:bg-brand-black"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={buildImageUrl(p.images?.[0])}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {p.subCategory}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatPrice(p.discountPrice || p.price)}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        p.inStock
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/${p._id}/edit`}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                      >
                        <FiEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-full text-sm font-medium ${
                page === i + 1
                  ? 'bg-brand-green text-white'
                  : 'hover:bg-brand-green-soft dark:hover:bg-brand-black-soft'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
