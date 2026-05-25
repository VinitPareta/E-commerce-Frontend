import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiPackage,
  FiClock,
  FiTruck,
  FiXCircle,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../utils/api";
import Loader from "../components/Loader";
import { formatPrice, buildImageUrl } from "../utils/helpers";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Complete: "bg-emerald-100 text-emerald-800",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Refunded: "bg-gray-100 text-gray-600",
};

// Banner config per status
const statusBanner = {
  Pending: {
    icon: FiClock,
    iconClass: "text-yellow-500",
    title: "Order Placed — Pending",
    desc: "Your order has been received and is awaiting confirmation.",
    bg: "from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10",
    border: "border-yellow-200 dark:border-yellow-800/30",
  },
  Processing: {
    icon: FiRefreshCw,
    iconClass: "text-blue-500",
    title: "Order is Being Processed",
    desc: "We're preparing your items for shipment.",
    bg: "from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10",
    border: "border-blue-200 dark:border-blue-800/30",
  },
  Shipped: {
    icon: FiTruck,
    iconClass: "text-purple-500",
    title: "Order Shipped!",
    desc: "Your order is on its way to you.",
    bg: "from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10",
    border: "border-purple-200 dark:border-purple-800/30",
  },
  Delivered: {
    icon: FiCheckCircle,
    iconClass: "text-green-500",
    title: "Order Delivered!",
    desc: "Your order has been delivered successfully.",
    bg: "from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10",
    border: "border-green-200 dark:border-green-800/30",
  },
  Complete: {
    icon: FiCheckCircle,
    iconClass: "text-emerald-500",
    title: "Order Complete!",
    desc: "Your order has been completed successfully. Thank you for shopping with us!",
    bg: "from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10",
    border: "border-emerald-200 dark:border-emerald-800/30",
  },
  Cancelled: {
    icon: FiXCircle,
    iconClass: "text-red-500",
    title: "Order Cancelled",
    desc: "This order has been cancelled.",
    bg: "from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10",
    border: "border-red-200 dark:border-red-800/30",
  },
  Refunded: {
    icon: FiAlertCircle,
    iconClass: "text-gray-500",
    title: "Order Refunded",
    desc: "A refund has been issued for this order.",
    bg: "from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10",
    border: "border-gray-200 dark:border-gray-700/30",
  },
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
    const sessionId = params.get("stripe_session_id");
    if (!sessionId) return;

    api
      .post("/payments/stripe/verify", { orderId: order._id, sessionId })
      .then((res) => setOrder(res.data.order))
      .catch(() => {});
  }, [order, location.search]);

  if (loading) return <Loader fullScreen />;
  if (!order)
    return (
      <div className="container-app py-20 text-center">
        Order not found.{" "}
        <Link to="/orders" className="text-brand-green underline">
          Back
        </Link>
      </div>
    );

  const banner = statusBanner[order.status] || statusBanner["Pending"];
  const BannerIcon = banner.icon;

  return (
    <div className="container-app py-8">
      {/* ── Status Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 flex flex-col items-center gap-3 p-8 text-center rounded-2xl border bg-gradient-to-br ${banner.bg} ${banner.border}`}
      >
        <BannerIcon className={`text-5xl ${banner.iconClass}`} />
        <h1 className="font-display text-2xl font-bold">{banner.title}</h1>
        <p className="text-sm text-gray-500">{banner.desc}</p>
        <p className="text-xs text-gray-400">
          Order #{order._id.slice(-8).toUpperCase()}
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Items */}
          <div className="card-glass p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">
                <FiPackage className="mr-2 inline" /> Items
              </h3>
              <span
                className={`badge ${statusColors[order.status] || "bg-gray-100"}`}
              >
                {order.status}
              </span>
            </div>

            <div className="divide-y divide-gray-200/60 dark:divide-white/10">
              {order.items.map((it, n) => (
                <div key={n} className="flex items-center gap-4 py-3">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-brand-green-soft">
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
                      {it.size && it.color && " • "}
                      {it.color && <>Color: {it.color}</>}
                      {" • "}Qty: {it.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(it.price * it.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card-glass p-6">
            <h3 className="mb-3 font-semibold">Shipping Address</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium text-brand-black dark:text-white">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
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
                    ? "FREE"
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
                <span className="font-bold text-brand-green">
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
                <span
                  className={`font-medium ${order.isPaid ? "text-green-600" : "text-red-500"}`}
                >
                  {order.isPaid ? "Yes" : "No"}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Paid At</span>
                  <span>{new Date(order.paidAt).toLocaleString("en-IN")}</span>
                </div>
              )}
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
