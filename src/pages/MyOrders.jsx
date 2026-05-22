import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiPackage,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import api from "../utils/api";
import Loader from "../components/Loader";
import { formatPrice } from "../utils/helpers";

const statusColors = {
  Pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200",
  Complete:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  Processing:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  Shipped:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
  Delivered:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
};

// Pagination Component
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];
  const delta = 1;
  const range = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  if (current - delta > 2) range.unshift("...");
  if (current + delta < total - 1) range.push("...");

  pages.push(1);
  range.forEach((p) => pages.push(p));
  if (total > 1) pages.push(total);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <FiChevronLeft size={15} /> Prev
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-3 py-2 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
              current === p
                ? "bg-brand-green text-white shadow-md shadow-brand-green/30"
                : "border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Next <FiChevronRight size={15} />
      </button>
    </div>
  );
}

// Main Page
const MyOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Get page from URL
  const currentPage = Number(searchParams.get("page")) || 1;

  // Fetch orders from API
  const fetchOrders = async (page) => {
    try {
      const res = await api.get(`/orders/me?page=${page}&limit=5`);
      setOrders(res.data?.orders || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalOrders(res.data?.totalOrders || 0);
    } catch (err) {
      toast.error(err.message || "Could not load orders");
      setOrders([]);
    }
  };

  //  On mount
  useEffect(() => {
    const init = async () => {
      await fetchOrders(currentPage);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On page change
  useEffect(() => {
    if (loading) return; // skip initial load
    const changePage = async () => {
      setPageLoading(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      await fetchOrders(currentPage);
      setPageLoading(false);
    };
    changePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (p) => {
    setSearchParams({ page: p });
  };

  const formatTxDate = (order) => {
    if (order.isPaid && order.paidAt)
      return new Date(order.paidAt).toLocaleString();
    return new Date(order.createdAt).toLocaleString();
  };

  const startIndex = (currentPage - 1) * 5;

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container-app py-8">
      <h1 className="heading">My Orders</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {totalOrders} order{totalOrders !== 1 && "s"} placed
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <FiPackage className="mx-auto text-6xl text-brand-green" />
          <p className="mt-4 text-lg font-semibold">No orders yet</p>
          <Link to="/shop" className="btn-primary mt-5 inline-flex">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div
            className={`mt-8 overflow-x-auto rounded-2xl border border-gray-200/60 bg-white shadow-sm dark:border-white/10 dark:bg-brand-black-soft transition-opacity ${pageLoading ? "opacity-50" : "opacity-100"}`}
          >
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
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {formatTxDate(order)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-green">
                      {formatPrice(order.totalPrice)}
                    </td>
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

          {/* Showing X - Y of Z */}
          <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
            Showing {startIndex + 1}–{Math.min(startIndex + 5, totalOrders)} of{" "}
            {totalOrders} orders
          </p>

          {/* Pagination */}
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default MyOrders;
