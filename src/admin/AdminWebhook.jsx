import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiZap,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiX,
  FiUser,
  FiMail,
  FiCreditCard,
  FiCalendar,
  FiHash,
  FiPackage,
  FiAlertCircle,
  FiDollarSign,
} from "react-icons/fi";
import api from "../utils/api";
import Loader from "../components/Loader";
import { formatPrice } from "../utils/helpers";

const PAGE_SIZE = 10;

const statusConfig = {
  Paid: {
    color:
      "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    icon: <FiCheckCircle className="inline mr-1" />,
  },
  Unpaid: {
    color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    icon: <FiXCircle className="inline mr-1" />,
  },
  Refunded: {
    color: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
    icon: <FiClock className="inline mr-1" />,
  },
  "Refund Pending": {
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    icon: <FiClock className="inline mr-1" />,
  },
  "No Payment Required": {
    color: "bg-gray-100 text-gray-500",
    icon: <FiClock className="inline mr-1" />,
  },
};

const methodColors = {
  Card: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  UPI: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  COD: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

const fmt = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/* ─── Payment Detail Modal ───────────────────────────────── */
const PaymentModal = ({ event, onClose }) => {
  if (!event) return null;
  const sc = statusConfig[event.paymentStatus] || statusConfig["Unpaid"];

  const rows = [
    { icon: FiHash, label: "Order ID", value: `#${event.shortId}` },
    { icon: FiUser, label: "Customer", value: event.customerName },
    { icon: FiMail, label: "Email", value: event.customerEmail },
    { icon: FiPackage, label: "Products", value: event.products },
    { icon: FiDollarSign, label: "Amount", value: formatPrice(event.amount) },
    { icon: FiCreditCard, label: "Payment Method", value: event.paymentMethod },
    { icon: FiCalendar, label: "Created At", value: fmt(event.createdAt) },
    { icon: FiCalendar, label: "Paid At", value: fmt(event.paidAt) },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl bg-white dark:bg-brand-black-soft shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gradient-to-r from-brand-green/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10">
                <FiZap className="text-brand-green" size={18} />
              </div>
              <div>
                <h2 className="font-bold text-base">Payment Details</h2>
                <p className="text-xs text-gray-500">Order #{event.shortId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-400"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Status Banner */}
          <div
            className={`mx-6 mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${sc.color}`}
          >
            {sc.icon}
            {event.paymentStatus}
            {event.failureReason && (
              <span className="ml-auto flex items-center gap-1 text-xs font-normal opacity-80">
                <FiAlertCircle size={12} />
                {event.failureReason}
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="px-6 py-4 space-y-3">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-white/5">
                  <Icon size={13} className="text-brand-green" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide leading-none mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">
                    {value}
                  </p>
                </div>
              </div>
            ))}

            {/* Order Status */}
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-white/5">
                <FiPackage size={13} className="text-brand-green" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide leading-none mb-0.5">
                  Order Status
                </p>
                <span className="inline-block rounded-full bg-brand-green/10 text-brand-green px-2.5 py-0.5 text-xs font-semibold">
                  {event.orderStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              Close
            </button>
            <Link
              to={`/orders/${event.orderId}`}
              className="rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              onClick={onClose}
            >
              View Order
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const AdminWebhook = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/webhook-events");
        setEvents(data.events || []);
      } catch (err) {
        console.error("Failed to fetch webhook events:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, methodFilter]);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      e.shortId.toLowerCase().includes(q) ||
      e.customerName.toLowerCase().includes(q) ||
      e.customerEmail.toLowerCase().includes(q) ||
      e.products.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "All" || e.paymentStatus === statusFilter;
    const matchMethod =
      methodFilter === "All" || e.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getPageNumbers = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  };

  const totalPaid = events.filter((e) => e.paymentStatus === "Paid").length;
  const totalFailed = events.filter((e) => e.paymentStatus === "Unpaid").length;
  const totalRefunded = events.filter((e) =>
    ["Refunded", "Refund Pending"].includes(e.paymentStatus),
  ).length;
  const totalRevenue = events
    .filter((e) => e.paymentStatus === "Paid")
    .reduce((s, e) => s + e.amount, 0);

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <FiZap className="text-brand-green" /> Webhook Events
          </h1>
          <p className="text-sm text-gray-500">
            All payment events — successful, failed &amp; cancelled
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Revenue",
            value: formatPrice(totalRevenue),
            color: "text-brand-green",
          },
          { label: "Successful", value: totalPaid, color: "text-green-600" },
          {
            label: "Failed / Unpaid",
            value: totalFailed,
            color: "text-red-500",
          },
          { label: "Refunded", value: totalRefunded, color: "text-orange-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer, product..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-black-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Paid", "Unpaid", "Refunded", "Refund Pending"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === s
                  ? "bg-brand-green text-white"
                  : "bg-white hover:bg-brand-green-soft dark:bg-brand-black-soft"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["All", "Card", "UPI", "COD"].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                methodFilter === m
                  ? "bg-brand-green text-white"
                  : "bg-white hover:bg-brand-green-soft dark:bg-brand-black-soft"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto rounded-2xl bg-white shadow-card dark:bg-brand-black-soft"
      >
        <table className="w-full text-sm">
          <thead className="bg-brand-green-soft text-left text-xs uppercase text-brand-green-dark dark:bg-brand-black">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">Failure Reason</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Paid At</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <motion.tbody
            key={`${statusFilter}-${methodFilter}-${search}-${page}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-500">
                  No webhook events found
                </td>
              </tr>
            ) : (
              paginated.map((e) => {
                const sc =
                  statusConfig[e.paymentStatus] || statusConfig["Unpaid"];
                return (
                  <tr
                    key={e.orderId}
                    className="border-t border-gray-100 hover:bg-brand-green-soft/20 dark:border-white/10 dark:hover:bg-brand-black"
                  >
                    {/* Order ID */}
                    <td className="px-4 py-3 font-mono font-semibold text-brand-green">
                      <Link
                        to={`/admin/payments/${e.orderId}`}
                        className="hover:underline"
                      >
                        #{e.shortId}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="font-medium">{e.customerName}</p>
                      <p className="text-xs text-gray-500">{e.customerEmail}</p>
                    </td>

                    {/* Products */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                        {e.products}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(e.amount)}
                    </td>

                    {/* Method */}
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${methodColors[e.paymentMethod]}`}
                      >
                        {e.paymentMethod}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-3">
                      <span className={`badge ${sc.color}`}>
                        {sc.icon}
                        {e.paymentStatus}
                      </span>
                    </td>

                    {/* Failure Reason */}
                    <td className="px-4 py-3 text-xs max-w-[180px]">
                      {e.failureReason ? (
                        <span className="text-red-500 dark:text-red-400">
                          {e.failureReason}
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">
                          ✓ Success
                        </span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {fmt(e.createdAt)}
                    </td>

                    {/* Paid At */}
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {fmt(e.paidAt)}
                    </td>

                    {/* Action — View button */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedEvent(e)}
                        className="flex items-center gap-1.5 rounded-lg border border-brand-green/30 bg-brand-green/5 px-3 py-1.5 text-xs font-semibold text-brand-green hover:bg-brand-green hover:text-white transition"
                      >
                        <FiEye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </motion.tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {filtered.length}
            </span>{" "}
            events
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-brand-green hover:text-brand-green disabled:opacity-30 disabled:cursor-not-allowed dark:bg-brand-black-soft dark:border-white/10"
            >
              <FiChevronLeft size={14} />
            </button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-8 w-8 items-center justify-center text-xs text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                    page === p
                      ? "bg-brand-green text-white shadow-soft"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green dark:bg-brand-black-soft dark:border-white/10 dark:text-gray-300"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-brand-green hover:text-brand-green disabled:opacity-30 disabled:cursor-not-allowed dark:bg-brand-black-soft dark:border-white/10"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedEvent && (
        <PaymentModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default AdminWebhook;
