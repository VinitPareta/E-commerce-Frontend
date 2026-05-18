import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPackage, FiEye } from 'react-icons/fi';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatPrice } from '../utils/helpers';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200',
  Complete: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  Shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
};

const MyOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingStripe, setVerifyingStripe] = useState(false);
  const stripeVerificationStarted = useRef(false);

  const fetchOrders = useCallback(() => {
    return api
      .get('/orders/me')
      .then((res) => {
        const list = res.data?.orders;
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        toast.error(err.message || 'Could not load orders');
        setOrders([]);
      });
  }, []);

  useEffect(() => {
    const stripeOrderId = searchParams.get('stripe_order_id');
    const sessionId = searchParams.get('stripe_session_id');

    if (stripeOrderId && sessionId) {
      if (stripeVerificationStarted.current) return;
      stripeVerificationStarted.current = true;
      setVerifyingStripe(true);

      api
        .post('/payments/stripe/verify', { orderId: stripeOrderId, sessionId })
        .then(() => {
          toast.success('Payment successful');
          setSearchParams({}, { replace: true });
        })
        .catch((err) => {
          toast.error(err.message || 'Payment verification failed');
          setSearchParams({}, { replace: true });
        })
        .finally(() => {
          fetchOrders().finally(() => {
            setVerifyingStripe(false);
            setLoading(false);
          });
        });
      return;
    }

    fetchOrders().finally(() => setLoading(false));
  }, [searchParams, setSearchParams, fetchOrders]);

  const formatTxDate = (order) => {
    if (order.isPaid && order.paidAt) {
      return new Date(order.paidAt).toLocaleString();
    }
    return new Date(order.createdAt).toLocaleString();
  };

  if (loading || verifyingStripe) return <Loader fullScreen />;

  return (
    <div className="container-app py-8">
      <h1 className="heading">My Orders</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {orders.length} order{orders.length !== 1 && 's'} placed
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <FiPackage className="mx-auto text-6xl text-brand-pink" />
          <p className="mt-4 text-lg font-semibold">No orders yet</p>
          <Link to="/shop" className="btn-primary mt-5 inline-flex">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200/60 bg-white shadow-sm dark:border-white/10 dark:bg-brand-black-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Transaction date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="border-b border-gray-100 last:border-0 dark:border-white/5"
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-brand-black dark:text-white">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatTxDate(order)}</td>
                  <td className="px-4 py-3 font-semibold text-brand-pink">{formatPrice(order.totalPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                    >
                      <FiEye /> View
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
