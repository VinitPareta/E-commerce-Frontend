import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheckCircle, FiShoppingBag, FiList } from "react-icons/fi";
import { formatPrice } from "../utils/helpers";
import api from "../utils/api";
import { useCart } from "../context/CartContext";

// Confetti 
const COLORS = [
  "#4ade80",
  "#86efac",
  "#fbbf24",
  "#60a5fa",
  "#f472b6",
  "#a78bfa",
  "#fb923c",
];

function Confetti() {
  const pieces = Array.from({ length: 65 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: `${(i / 65) * 100}%`,
    delay: `${(i % 10) * 0.2}s`,
    duration: `${2.5 + (i % 5) * 0.4}s`,
    size: `${7 + (i % 5)}px`,
    isCircle: i % 2 === 0,
  }));

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
        {pieces.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: "-10px",
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.isCircle ? "50%" : "2px",
              animation: `confettiFall ${p.duration} ease-in ${p.delay} both`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// Loading 
function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-brand-black">
      <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      <p className="text-gray-500 text-sm">Verifying your payment...</p>
    </div>
  );
}

// Page 
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useCart();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clean URL
    window.history.replaceState({}, "", "/payment-successful");

    // COD: order already passed via navigate state, nothing to do
    if (order) return;

    // Stripe: read session_id from URL
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) return;

    const verify = async () => {
      try {
        setLoading(true);

        // Step 1: get orderId from Stripe session metadata
        const { data: sessionData } = await api.get(
          `/payments/stripe/session/${sessionId}`,
        );
        const orderId = sessionData.orderId;

        // Step 2: verify and mark order paid
        const { data } = await api.post("/payments/stripe/verify", {
          orderId,
          sessionId,
        });

        await refresh(); // clear cart
        setOrder(data.order);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Verification failed",
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-brand-black px-4 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-gray-700 dark:text-white font-semibold">
          Payment verification failed
        </p>
        <p className="text-gray-500 text-sm">{error}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => navigate("/orders")} className="btn-primary">
            View Orders
          </button>
          <button onClick={() => navigate("/")} className="btn-secondary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-brand-black">
        <p className="text-gray-500">No order information found.</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  const orderId = order._id.slice(-8).toUpperCase();
  const paidAt = new Date(order.paidAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <Confetti />

      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-72 bg-emerald-400/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-brand-black-soft"
      >
        {/* GREEN HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 to-green-600 px-6 pb-10 pt-10 text-center">
          <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-6 h-24 w-24 rounded-full bg-white/10" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg"
          >
            <FiCheckCircle className="text-4xl text-emerald-500" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white"
          >
            Payment Successful!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-1 text-sm text-green-100"
          >
            Your order has been confirmed 🎉
          </motion.p>
        </div>

        {/* AMOUNT BADGE */}
        <div className="relative z-20 flex justify-center -mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-full bg-white px-6 py-3 shadow-2xl dark:bg-brand-black border border-emerald-100 dark:border-emerald-900"
          >
            <span className="text-2xl font-extrabold text-emerald-600">
              {formatPrice(order.totalPrice)}
            </span>
          </motion.div>
        </div>

        {/* BODY */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-6 pb-2 pt-4"
        >
          {/* ORDER INFO GRID */}
          <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Order ID</p>
                <p className="font-bold text-gray-800 dark:text-white">
                  #{orderId}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Payment Method</p>
                <p className="font-bold text-gray-800 dark:text-white">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Payment Date</p>
                <p className="font-bold text-gray-800 dark:text-white">
                  {paidAt}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Items Ordered
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-white/5"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}
                      {item.size && ` • ${item.size}`}
                      {item.color && ` • ${item.color}`}
                    </p>
                  </div>
                  <p className="ml-2 text-sm font-bold text-emerald-600">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PRICE SUMMARY */}
          <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-white/5 text-sm space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>
                {order.shippingPrice === 0
                  ? "FREE"
                  : formatPrice(order.shippingPrice)}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax</span>
              <span>{formatPrice(order.taxPrice)}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 dark:border-gray-600 pt-1 flex justify-between font-bold text-base">
              <span className="text-gray-800 dark:text-white">Total Paid</span>
              <span className="text-emerald-600">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-3 p-6 pt-4"
        >
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <FiList size={16} />
            View Orders
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:opacity-90 dark:shadow-none"
          >
            <FiShoppingBag size={16} />
            Shop More
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
