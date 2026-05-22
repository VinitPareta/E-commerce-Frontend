import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import api from "../utils/api";
import Loader from "../components/Loader";
import { formatPrice } from "../utils/helpers";

const statuses = [
  "Pending",
  "Complete",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Complete: "bg-emerald-100 text-emerald-800",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const PAGE_SIZE = 10;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reset to page 1 whenever filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success("Status updated");
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o)),
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader fullScreen />;

  const filtered =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Build page numbers with ellipsis
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Orders</h1>
          <p className="text-sm text-gray-500">
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            {filter !== "All" ? ` · ${filter}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...statuses].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filter === s
                  ? "bg-brand-green text-white"
                  : "bg-white hover:bg-brand-green-soft dark:bg-brand-black-soft"
              }`}
            >
              {s}
              {s !== "All" && (
                <span className="ml-1.5 opacity-60">
                  {orders.filter((o) => o.status === s).length}
                </span>
              )}
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
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody
              key={`${filter}-${page}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {paginated.map((o) => (
                <tr
                  key={o._id}
                  className="border-t border-gray-100 hover:bg-brand-green-soft/20 dark:border-white/10 dark:hover:bg-brand-black"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/orders/${o._id}`}
                      className="font-medium text-brand-green hover:underline"
                    >
                      #{o._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{o.user?.name || "—"}</p>
                      <p className="text-xs text-gray-500">{o.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{o.items.length}</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatPrice(o.totalPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-gray-100 text-gray-700 dark:bg-brand-black dark:text-gray-300">
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${statusColors[o.status]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
          {/* Showing X–Y of Z */}
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
            orders
          </p>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            {/* Prev */}
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

            {/* Next */}
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
    </div>
  );
};

export default AdminOrders;
