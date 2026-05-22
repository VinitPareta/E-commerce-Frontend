import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiShoppingBag, FiList, FiX } from "react-icons/fi";
import { formatPrice } from "../utils/helpers";

const PaymentSuccessModal = ({ order, onClose }) => {
  const navigate = useNavigate();

  if (!order) return null;

  const orderId = order._id.slice(-8).toUpperCase();
  const paidAt = new Date(order.paidAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AnimatePresence>
      debugger
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        {/* MODAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-brand-black-soft"
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
          >
            <FiX size={18} />
          </button>

          {/* GREEN HEADER */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 to-green-600 px-6 pb-10 pt-10 text-center">
            {/* CIRCLE BACKGROUND EFFECTS */}
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -right-4 -bottom-6 h-24 w-24 rounded-full bg-white/10" />

            {/* SUCCESS ICON */}
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
          <div className="relative z-20 flex justify-center -mt-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-full bg-white px-6 py-3 shadow-2xl dark:bg-brand-black border border-emerald-100"
            >
              <span className="text-2xl font-extrabold text-emerald-600">
                {formatPrice(order.totalPrice)}
              </span>
            </motion.div>
          </div>

          {/* ORDER DETAILS */}
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
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
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
                <span className="text-gray-800 dark:text-white">
                  Total Paid
                </span>
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
            {/* VIEW ORDERS */}
            <button
              onClick={() => {
                onClose();
                navigate("/orders");
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <FiList size={16} />
              View Orders
            </button>

            {/* CONTINUE SHOPPING */}
            <button
              onClick={() => {
                onClose();
                navigate("/shop");
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:opacity-90 dark:shadow-none"
            >
              <FiShoppingBag size={16} />
              Shop More
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentSuccessModal;
