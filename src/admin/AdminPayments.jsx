import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiCreditCard,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import api from "../utils/api";
import Loader from "../components/Loader";
import { formatPrice } from "../utils/helpers";

const PAGE_SIZE = 10;

const methodBadge = (method) => {
  const styles = {
    Card: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    UPI: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    COD: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  };
  return styles[method] || "bg-gray-100 text-gray-600";
};

const statusBadge = (status) => {
  const styles = {
    Paid: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    Unpaid: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    Refunded: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
    "Refund Pending":
      "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  };
  return styles[status] || "bg-gray-100 text-gray-600";
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/payments");
        setPayments(data.payments || []);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.shortId.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.customerEmail.toLowerCase().includes(q) ||
      p.transactionId.toLowerCase().includes(q);
    const matchesFilter = filter === "All" || p.paymentMethod === filter;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = filtered.reduce((sum, p) => sum + p.amount, 0);
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

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <FiCreditCard className="text-brand-green" /> Payments
          </h1>
          <p className="text-sm text-gray-500">
            {filtered.length} payment{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue", value: formatPrice(totalRevenue) },
          { label: "Total Payments", value: filtered.length },
          {
            label: "Card / UPI",
            value: filtered.filter((p) => p.paymentMethod !== "COD").length,
          },
          {
            label: "COD",
            value: filtered.filter((p) => p.paymentMethod === "COD").length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-brand-green">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, name, email, transaction..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-black-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Card", "UPI", "COD"].map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filter === m
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
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Paid At</th>
            </tr>
          </thead>
          <motion.tbody
            key={`${filter}-${search}-${page}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr
                  key={p.orderId}
                  className="border-t border-gray-100 hover:bg-brand-green-soft/20 dark:border-white/10 dark:hover:bg-brand-black"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-brand-green">
                    <Link
                      to={`/admin/payments/${p.orderId}`}
                      className="hover:underline"
                    >
                      #{p.shortId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.customerName}</p>
                    <p className="text-xs text-gray-500">{p.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatPrice(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${methodBadge(p.paymentMethod)}`}>
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusBadge(p.paymentStatus)}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[140px] truncate">
                    {p.transactionId !== "—" ? p.transactionId.slice(-16) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              ))
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
            payments
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
    </div>
  );
};

export default AdminPayments;
