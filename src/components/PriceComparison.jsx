import { useState, useEffect } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiExternalLink,
  FiRefreshCw,
  FiTrendingDown,
  FiTrendingUp,
  FiMinus,
  FiAlertCircle,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

const STATUS_CONFIG = {
  lowest: {
    color: "#10b981",
    bg: "#ecfdf5",
    label: "Best Price 🏆",
    icon: FiTrendingDown,
  },
  below_average: {
    color: "#10b981",
    bg: "#ecfdf5",
    label: "Below Average ✅",
    icon: FiTrendingDown,
  },
  average: {
    color: "#f59e0b",
    bg: "#fffbeb",
    label: "Fair Price ⚖️",
    icon: FiMinus,
  },
  above_average: {
    color: "#f97316",
    bg: "#fff7ed",
    label: "Above Average 📊",
    icon: FiTrendingUp,
  },
  highest: {
    color: "#ef4444",
    bg: "#fef2f2",
    label: "Premium Priced 💎",
    icon: FiTrendingUp,
  },
};

export default function PriceComparison({
  productId,
  ourPrice,
  autoExpand = false,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(autoExpand || false);

  useEffect(() => {
    if (!productId) return;
    fetchComparison();
  }, [productId]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/comparison/${productId}`);
      const json = res.data;
      if (json.success && json.comparison) {
        setData(json.comparison);
      } else {
        setData(null);
      }
    } catch (e) {
      setError("Could not load price comparison.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-100 dark:border-white/10 p-4 animate-pulse">
        <div className="h-4 bg-gray-100 dark:bg-white/10 rounded w-48 mb-3" />
        <div className="h-3 bg-gray-100 dark:bg-white/10 rounded w-full mb-2" />
        <div className="h-3 bg-gray-100 dark:bg-white/10 rounded w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-2xl border border-red-100 dark:border-red-500/20 p-4 flex items-center gap-3 text-sm text-red-500">
        <FiAlertCircle /> {error}
      </div>
    );
  }

  if (!data) return null;

  const status = STATUS_CONFIG[data.ourPriceStatus] || STATUS_CONFIG.average;
  const StatusIcon = status.icon;
  const savings = data.highestPrice - data.ourPrice;
  const savingsPercent =
    data.highestPrice > 0
      ? Math.round(
          ((data.highestPrice - data.ourPrice) / data.highestPrice) * 100,
        )
      : 0;

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: status.bg }}
          >
            <StatusIcon size={18} style={{ color: status.color }} />
          </div>
          <div>
            <div className="font-semibold text-sm flex items-center gap-2">
              Price Comparison
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Compared with {data.comparisons.length} stores · Updated{" "}
              {new Date(data.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-white/10">
              {/* Explanation */}
              <div
                className="mt-4 p-3 rounded-xl text-sm leading-relaxed"
                style={{ background: status.bg, color: status.color }}
              >
                {data.explanation}
              </div>

              {/* Price summary cards */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  {
                    label: "Lowest",
                    value: data.lowestPrice,
                    highlight: data.ourPriceStatus === "lowest",
                  },
                  {
                    label: "Average",
                    value: data.averagePrice,
                    highlight: data.ourPriceStatus === "average",
                  },
                  {
                    label: "Highest",
                    value: data.highestPrice,
                    highlight: data.ourPriceStatus === "highest",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl p-3 text-center border ${item.highlight ? "border-brand-green bg-brand-green/5" : "border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5"}`}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.label}
                    </div>
                    <div
                      className={`font-bold text-base mt-0.5 ${item.highlight ? "text-brand-green" : ""}`}
                    >
                      ₹{item.value?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Our price vs market */}
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    DS Store Price
                  </div>
                  <div className="text-xl font-bold">
                    ₹{data.ourPrice?.toLocaleString()}
                  </div>
                </div>
                {savings > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">vs Highest</div>
                    <div className="text-sm font-semibold text-green-600">
                      Save ₹{savings.toLocaleString()} ({savingsPercent}%)
                    </div>
                  </div>
                )}
              </div>

              {/* Price bar visualization */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>₹{data.lowestPrice?.toLocaleString()}</span>
                  <span>₹{data.highestPrice?.toLocaleString()}</span>
                </div>
                <div className="relative h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  {/* Range bar */}
                  <div className="absolute inset-y-0 bg-gradient-to-r from-green-400 to-red-400 rounded-full w-full opacity-30" />
                  {/* Our price marker */}
                  {data.highestPrice > data.lowestPrice && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
                      style={{
                        left: `${Math.max(0, Math.min(100, ((data.ourPrice - data.lowestPrice) / (data.highestPrice - data.lowestPrice)) * 100))}%`,
                        transform: "translate(-50%, -50%)",
                        background: status.color,
                      }}
                    />
                  )}
                </div>
                <div className="text-center text-xs text-gray-500 mt-1">
                  DS Store: ₹{data.ourPrice?.toLocaleString()}
                </div>
              </div>

              {/* Comparison table */}
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Prices from other stores
                </div>
                <div className="space-y-2">
                  {/* DS Store row */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-green/5 border border-brand-green/20">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-brand-green flex items-center justify-center text-white text-xs font-bold">
                        DS
                      </div>
                      <span className="text-sm font-semibold">DS Store</span>
                      <span className="text-xs bg-brand-green text-white px-1.5 py-0.5 rounded-full">
                        You are here
                      </span>
                    </div>
                    <span className="font-bold text-brand-green">
                      ₹{data.ourPrice?.toLocaleString()}
                    </span>
                  </div>

                  {/* Other stores */}
                  {data.comparisons
                    .sort((a, b) => a.price - b.price)
                    .map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {item.source?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm truncate">
                            {item.source}
                          </span>
                          {item.rating > 0 && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              ⭐ {item.rating}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`font-semibold text-sm ${item.price < data.ourPrice ? "text-red-500" : item.price > data.ourPrice ? "text-green-600" : ""}`}
                          >
                            ₹{item.price?.toLocaleString()}
                          </span>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-400 hover:text-brand-green transition"
                            >
                              <FiExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Last updated */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>
                  Prices updated: {new Date(data.lastUpdated).toLocaleString()}
                </span>
                <button
                  onClick={fetchComparison}
                  className="flex items-center gap-1 hover:text-brand-green transition"
                >
                  <FiRefreshCw size={11} /> Refresh
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
