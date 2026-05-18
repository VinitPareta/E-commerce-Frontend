import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatPrice, buildImageUrl } from '../utils/helpers';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Complete: 'bg-emerald-100 text-emerald-800',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order) return;
    if (order.isPaid) return;
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('stripe_session_id');
    if (!sessionId) return;

    api
      .post('/payments/stripe/verify', { orderId: order._id, sessionId })
      .then((res) => setOrder(res.data.order))
      .catch(() => {
        // ignore; UI already shows unpaid
      });
  }, [order, location.search]);

  if (loading) return <Loader fullScreen />;
  if (!order)
    return (
      <div className="container-app py-20 text-center">
        Order not found.{' '}
        <Link to="/orders" className="text-brand-pink underline">
          Back
        </Link>
      </div>
    );

  return (
    <div className="container-app py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass mb-6 flex flex-col items-center gap-3 p-8 text-center"
      >
        <FiCheckCircle className="text-5xl text-green-500" />
        <h1 className="font-display text-2xl font-bold">Thank you!</h1>
        <p className="text-sm text-gray-500">
          Your order has been placed successfully
        </p>
        <p className="text-xs text-gray-400">
          Order #{order._id.slice(-8).toUpperCase()}
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="card-glass p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">
                <FiPackage className="mr-2 inline" /> Items
              </h3>
              <span
                className={`badge ${
                  statusColors[order.status] || 'bg-gray-100'
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="divide-y divide-gray-200/60 dark:divide-white/10">
              {order.items.map((it, n) => (
                <div key={n} className="flex items-center gap-4 py-3">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-brand-pink-soft">
                    <img
                      src={buildImageUrl(it.image)}
                      alt={it.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{it.name}</p>
                    <p className="text-xs text-gray-500">
                      {it.size && <>Size: {it.size}</>}
                      {it.size && it.color && ' • '}
                      {it.color && <>Color: {it.color}</>}
                      {' • '}Qty: {it.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(it.price * it.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glass p-6">
            <h3 className="mb-3 font-semibold">Shipping Address</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium text-brand-black dark:text-white">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>

        <aside className="self-start lg:sticky lg:top-24">
          <div className="card-glass p-6">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.shippingPrice === 0
                    ? 'FREE'
                    : formatPrice(order.shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="my-2 border-t border-dashed border-gray-300 dark:border-gray-600" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-brand-pink">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
              <div className="my-2 border-t border-dashed border-gray-300 dark:border-gray-600" />
              <div className="flex justify-between">
                <span>Payment</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid</span>
                <span className="font-medium">{order.isPaid ? 'Yes' : 'No'}</span>
              </div>
            </div>
            <Link to="/orders" className="btn-outline mt-5 w-full">
              View All Orders
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetails;
