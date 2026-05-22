import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCreditCard,
  FiPackage,
  FiUser,
  FiMapPin,
  FiHash,
} from "react-icons/fi";
import api from "../utils/api";
import Loader from "../components/Loader";
import { formatPrice } from "../utils/helpers";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Complete: "bg-emerald-100 text-emerald-800",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Refunded: "bg-gray-100 text-gray-600",
};

const paymentStatusColors = {
  Paid: "bg-green-100 text-green-700",
  Unpaid: "bg-red-100 text-red-700",
  Refunded: "bg-gray-100 text-gray-600",
  "Refund Pending": "bg-orange-100 text-orange-700",
  "No Payment Required": "bg-gray-100 text-gray-500",
};

const methodColors = {
  Card: "bg-blue-50 text-blue-700",
  UPI: "bg-purple-50 text-purple-700",
  COD: "bg-amber-50 text-amber-700",
};

const AdminPaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order || data);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loader fullScreen />;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 font-medium">Order not found</p>
        <button
          onClick={() => navigate("/admin/payments")}
          className="text-sm text-brand-green hover:underline"
        >
          ← Back to Payments
        </button>
      </div>
    );
  }

  const shortId = order._id.toString().slice(-8).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/payments")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green transition"
        >
          <FiArrowLeft /> Back to Payments
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Order <span className="text-brand-green">#{shortId}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className={`badge ${statusColors[order.status]}`}>
            {order.status}
          </span>
          <span className={`badge ${paymentStatusColors[order.paymentStatus]}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left column — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <FiPackage className="text-brand-green" />
              <h2 className="font-semibold">Order Items</h2>
              <span className="ml-auto text-xs text-gray-400">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-xl object-cover flex-shrink-0 border border-gray-100 dark:border-white/10"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-sm flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <FiCreditCard className="text-brand-green" />
              <h2 className="font-semibold">Payment Details</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <Row label="Payment Method">
                <span className={`badge ${methodColors[order.paymentMethod]}`}>
                  {order.paymentMethod}
                </span>
              </Row>
              <Row label="Payment Status">
                <span
                  className={`badge ${paymentStatusColors[order.paymentStatus]}`}
                >
                  {order.paymentStatus}
                </span>
              </Row>
              {order.paymentResult?.provider && (
                <Row label="Provider">
                  <span className="capitalize">
                    {order.paymentResult.provider}
                  </span>
                </Row>
              )}
              {order.paymentResult?.paymentId && (
                <Row label="Transaction ID">
                  <span className="font-mono text-xs text-gray-500 break-all">
                    {order.paymentResult.paymentId}
                  </span>
                </Row>
              )}
              {order.paymentResult?.orderId && (
                <Row label="Payment Intent">
                  <span className="font-mono text-xs text-gray-500 break-all">
                    {order.paymentResult.orderId}
                  </span>
                </Row>
              )}
              {order.paidAt && (
                <Row label="Paid At">
                  {new Date(order.paidAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Row>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <FiHash className="text-brand-green" />
              <h2 className="font-semibold">Price Breakdown</h2>
            </div>
            <div className="px-5 py-4 space-y-2 text-sm">
              <Row label="Items">{formatPrice(order.itemsPrice)}</Row>
              <Row label="Shipping">{formatPrice(order.shippingPrice)}</Row>
              <Row label="Tax">{formatPrice(order.taxPrice)}</Row>
              <div className="border-t border-gray-100 dark:border-white/10 pt-3 mt-2">
                <Row label={<span className="font-bold text-base">Total</span>}>
                  <span className="font-bold text-base text-brand-green">
                    {formatPrice(order.totalPrice)}
                  </span>
                </Row>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <FiUser className="text-brand-green" />
              <h2 className="font-semibold">Customer</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white flex-shrink-0">
                  {(order.user?.name || order.shippingAddress.fullName)
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {order.user?.name || order.shippingAddress.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {order.user?.email || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <FiMapPin className="text-brand-green" />
              <h2 className="font-semibold">Shipping Address</h2>
            </div>
            <div className="px-5 py-4 text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-800 dark:text-white">
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

          {/* Timeline */}
          <div className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <h2 className="font-semibold">Timeline</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-xs text-gray-500">
              <TimelineItem
                label="Order Placed"
                date={order.createdAt}
                active
              />
              {order.paidAt && (
                <TimelineItem
                  label="Payment Confirmed"
                  date={order.paidAt}
                  active
                />
              )}
              {order.deliveredAt && (
                <TimelineItem
                  label="Delivered"
                  date={order.deliveredAt}
                  active
                />
              )}
              {order.refundRequestedAt && (
                <TimelineItem
                  label="Refund Requested"
                  date={order.refundRequestedAt}
                />
              )}
              {order.refundedAt && (
                <TimelineItem label="Refunded" date={order.refundedAt} />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-gray-500 flex-shrink-0">{label}</span>
    <span className="text-right">{children}</span>
  </div>
);

const TimelineItem = ({ label, date, active }) => (
  <div className="flex items-start gap-3">
    <div
      className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${active ? "bg-brand-green" : "bg-gray-300"}`}
    />
    <div>
      <p
        className={`font-medium ${active ? "text-gray-800 dark:text-white" : "text-gray-400"}`}
      >
        {label}
      </p>
      <p>
        {new Date(date).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  </div>
);

export default AdminPaymentDetail;
