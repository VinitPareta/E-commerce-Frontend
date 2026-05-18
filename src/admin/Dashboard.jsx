import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiAlertTriangle,
  FiTrendingUp,
} from 'react-icons/fi';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatPrice } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;
  if (!stats) return <p>Failed to load stats</p>;

  const cards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: FiBox,
      color: 'from-pink-500 to-pink-700',
      link: '/admin/products',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: 'from-purple-500 to-purple-700',
      link: '/admin/orders',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-700',
      link: '/admin/users',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: FiDollarSign,
      color: 'from-green-500 to-green-700',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your store</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Card = (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl bg-gradient-to-br ${c.color} p-5 text-white shadow-card transition hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <c.icon className="text-2xl opacity-80" />
                <FiTrendingUp className="text-sm opacity-60" />
              </div>
              <p className="mt-4 text-2xl font-bold">{c.value}</p>
              <p className="text-sm opacity-90">{c.label}</p>
            </motion.div>
          );
          return c.link ? (
            <Link to={c.link} key={c.label}>
              {Card}
            </Link>
          ) : (
            <div key={c.label}>{Card}</div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card-glass p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-brand-pink hover:underline"
            >
              View all
            </Link>
          </div>

          {stats.recentOrders?.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="pb-2">Order</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Total</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders?.map((o) => (
                    <tr key={o._id} className="border-t border-gray-100 dark:border-white/10">
                      <td className="py-2.5">
                        <Link
                          to={`/orders/${o._id}`}
                          className="font-medium text-brand-pink hover:underline"
                        >
                          #{o._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-2.5">{o.user?.name || '—'}</td>
                      <td className="py-2.5 font-semibold">
                        {formatPrice(o.totalPrice)}
                      </td>
                      <td className="py-2.5">
                        <span className="badge bg-brand-pink/10 text-brand-pink">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-glass p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FiAlertTriangle className="text-yellow-500" /> Low Stock
          </h3>
          {stats.lowStock?.length === 0 ? (
            <p className="text-sm text-gray-500">All products well stocked</p>
          ) : (
            <ul className="space-y-3">
              {stats.lowStock?.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="line-clamp-1">{p.name}</span>
                  <span
                    className={`badge ${
                      p.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
