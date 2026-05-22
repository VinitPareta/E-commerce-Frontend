import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiAlertTriangle,
  FiTrendingUp,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../utils/api";
import Loader from "../components/Loader";
import { formatPrice } from "../utils/helpers";

//Custom Tooltip
const CustomTooltip = ({ active, payload, label, formatValue }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: "8px 14px",
          fontSize: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: 4, color: "#374151" }}>
          {label}
        </p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, margin: "2px 0" }}>
            {p.name}:{" "}
            <strong>{formatValue ? formatValue(p.value) : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

//Weekly Revenue Custom Bar
const WeeklyBar = (props) => {
  const { x, y, width, height, value, isToday } = props;
  if (!height || height <= 0) return null;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        ry={6}
        fill={isToday ? "#10b981" : "#6366f1"}
        opacity={isToday ? 1 : 0.75}
      />
    </g>
  );
};

//Semicircle Gauge
const GAUGE_COLORS = {
  Cancelled: "#ef4444",
  Pending: "#f59e0b",
  Completed: "#22c55e",
  Processing: "#94a3b8",
  Shipped: "#3b82f6",
};

const GaugeChart = ({ data, total }) => (
  <div style={{ position: "relative", width: "100%", height: 190 }}>
    <ResponsiveContainer width="100%" height={190}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="80%"
          startAngle={180}
          endAngle={0}
          innerRadius={65}
          outerRadius={95}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={GAUGE_COLORS[entry.name] || "#cbd5e1"} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
    <div
      style={{
        position: "absolute",
        bottom: 6,
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>
        {total}
      </p>
      <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Orders</p>
    </div>
  </div>
);

// Animated Horizontal Bar
const HBar = ({ label, value, percent, color }) => (
  <div style={{ marginBottom: 14 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        marginBottom: 4,
        color: "#374151",
      }}
    >
      <span style={{ fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#6b7280" }}>{value}</span>
    </div>
    <div
      style={{
        background: "#f1f5f9",
        borderRadius: 6,
        height: 8,
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ height: "100%", background: color, borderRadius: 6 }}
      />
    </div>
    <span style={{ fontSize: 10, color, fontWeight: 600 }}>{percent}%</span>
  </div>
);

// Shared styles
const sec = {
  background: "#fff",
  borderRadius: 16,
  padding: "20px 24px",
  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  border: "1px solid #f1f5f9",
};
const ttl = {
  fontSize: 15,
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: 2,
  display: "flex",
  alignItems: "center",
  gap: 8,
};
const sub = { fontSize: 12, color: "#94a3b8", marginBottom: 16, marginTop: 2 };
const badge = (bg = "#ede9fe", color = "#7c3aed") => ({
  fontSize: 11,
  fontWeight: 600,
  background: bg,
  color,
  borderRadius: 20,
  padding: "2px 10px",
});

// Main Dashboard
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;
  if (!stats) return <p>Failed to load stats</p>;

  const cards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: FiBox,
      color: "from-pink-500 to-pink-700",
      link: "/admin/products",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: "from-purple-500 to-purple-700",
      link: "/admin/orders",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: FiUsers,
      color: "from-blue-500 to-blue-700",
      link: "/admin/users",
    },
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: FiDollarSign,
      color: "from-green-500 to-green-700",
    },
  ];

  const orderTrend = stats.orderTrend || [];
  const revenueTrend = stats.revenueTrend || [];
  const weeklyRevenue = stats.weeklyRevenue || [];
  const paymentMethods = stats.paymentMethods || [];
  const orderStatus = stats.orderStatus || [];

  const orderTotal = orderStatus.reduce((s, d) => s + d.value, 0);
  const completedCount =
    orderStatus.find((d) => d.name === "Completed")?.value || 0;
  const completionRate =
    orderTotal > 0 ? Math.round((completedCount / orderTotal) * 100) : 0;
  const topPayment = paymentMethods[0];

  // Today's day label for highlighting
  const todayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date().getDay()
  ];
  const weeklyTotal = weeklyRevenue.reduce((s, d) => s + d.revenue, 0);
  const weeklyOrders = weeklyRevenue.reduce((s, d) => s + d.orders, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your store</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((c, i) => {
          const Card = (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl bg-gradient-to-br ${c.color} p-5 text-white shadow-card transition hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <c.icon className="text-2xl opacity-80" />
                <FiTrendingUp className="text-sm opacity-60" />
              </div>
              <p className="mt-4 text-2xl font-bold">{c.value}</p>
              <p className="text-sm opacity-90">{c.label}</p>
            </motion.div>
          );
          return c.link ? (
            <Link to={c.link} key={c.label}>
              {Card}
            </Link>
          ) : (
            <div key={c.label}>{Card}</div>
          );
        })}
      </div>

      {/* ── Weekly Revenue (full width) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ ...sec, marginBottom: 20 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={ttl}>
              Revenue — Last 7 Days
              <span style={badge("#dcfce7", "#16a34a")}>This Week</span>
            </div>
            <p style={sub}>Daily revenue breakdown · green bar = today</p>
          </div>
          <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                7-Day Revenue
              </p>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                {formatPrice(weeklyTotal)}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                7-Day Orders
              </p>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                {weeklyOrders}
              </p>
            </div>
          </div>
        </div>

        {weeklyRevenue.length === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: "#94a3b8",
              textAlign: "center",
              paddingTop: 60,
            }}
          >
            No data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={weeklyRevenue}
              barSize={38}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y + 14}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={payload.value === todayLabel ? 700 : 400}
                    fill={payload.value === todayLabel ? "#10b981" : "#94a3b8"}
                  >
                    {payload.value}
                  </text>
                )}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`
                }
              />
              <Tooltip
                content={
                  <CustomTooltip
                    formatValue={(v) => `₹${v.toLocaleString("en-IN")}`}
                  />
                }
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                radius={[6, 6, 0, 0]}
                shape={(props) => (
                  <WeeklyBar {...props} isToday={props.day === todayLabel} />
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Day summary pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {weeklyRevenue.map((d) => (
            <div
              key={d.day}
              style={{
                flexShrink: 0,
                background: d.day === todayLabel ? "#ecfdf5" : "#f8fafc",
                border: `1px solid ${d.day === todayLabel ? "#bbf7d0" : "#e2e8f0"}`,
                borderRadius: 10,
                padding: "6px 14px",
                textAlign: "center",
                minWidth: 70,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: d.day === todayLabel ? "#10b981" : "#94a3b8",
                  margin: 0,
                }}
              >
                {d.day}
                {d.day === todayLabel ? " ·  Today" : ""}
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: "2px 0 0",
                }}
              >
                {d.revenue > 0 ? `₹${d.revenue.toLocaleString("en-IN")}` : "—"}
              </p>
              <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
                {d.orders} {d.orders === 1 ? "order" : "orders"}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Row 1: Order Trend + Order Status ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={sec}
        >
          <div style={ttl}>
            Order Trend
            <span style={badge()}>{completionRate}% completion</span>
          </div>
          <p style={sub}>
            Monthly · Total, completed, and cancelled orders over time
          </p>
          {orderTrend.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                textAlign: "center",
                paddingTop: 60,
              }}
            >
              No order data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={orderTrend} barSize={16}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  dataKey="total"
                  name="Total Orders"
                  fill="#c4b5fd"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#22c55e" }}
                />
                <Line
                  type="monotone"
                  dataKey="cancelled"
                  name="Cancelled"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#ef4444" }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={sec}
        >
          <div style={ttl}>Order Status</div>
          <p style={sub}>
            {orderTotal} total orders · {completionRate}% completion rate
          </p>
          {orderStatus.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                textAlign: "center",
                paddingTop: 60,
              }}
            >
              No data yet
            </p>
          ) : (
            <GaugeChart data={orderStatus} total={orderTotal} />
          )}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 14px",
              marginTop: 10,
            }}
          >
            {orderStatus.map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  color: "#374151",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: GAUGE_COLORS[item.name] || "#cbd5e1",
                    display: "inline-block",
                  }}
                />
                {item.name}{" "}
                <strong style={{ marginLeft: 2 }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Revenue Trend + Payment Methods ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={sec}
        >
          <div style={ttl}>Revenue Trend</div>
          <p style={sub}>Monthly revenue (excluding cancelled orders)</p>
          {revenueTrend.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                textAlign: "center",
                paddingTop: 60,
              }}
            >
              No revenue data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`
                  }
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatValue={(v) => `₹${v.toLocaleString("en-IN")}`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={sec}
        >
          <div style={ttl}>
            Payment Methods
            {topPayment && (
              <span style={badge("#fef3c7", "#d97706")}>
                {topPayment.label} leads {topPayment.percent}%
              </span>
            )}
          </div>
          <p style={sub}>Transaction volume by payment type</p>
          {paymentMethods.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                textAlign: "center",
                paddingTop: 40,
              }}
            >
              No payment data yet
            </p>
          ) : (
            <>
              {paymentMethods.map((p) => (
                <HBar
                  key={p.label}
                  label={p.label}
                  value={p.value}
                  percent={p.percent}
                  color={p.color}
                />
              ))}
              <div
                style={{
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: 10,
                  marginTop: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#374151",
                }}
              >
                <span style={{ fontWeight: 600 }}>Total Transactions</span>
                <span style={{ fontWeight: 700 }}>
                  {paymentMethods.reduce((s, p) => s + p.value, 0)}
                </span>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Row 3: Recent Orders + Low Stock ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={sec}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-brand-green hover:underline"
            >
              View all
            </Link>
          </div>
          {!stats.recentOrders?.length ? (
            <p className="text-sm text-gray-500">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="pb-2">Order</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Total</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr
                      key={o._id}
                      className="border-t border-gray-100 dark:border-white/10"
                    >
                      <td className="py-2.5">
                        <Link
                          to={`/orders/${o._id}`}
                          className="font-medium text-brand-green hover:underline"
                        >
                          #{o._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-2.5">{o.user?.name || "—"}</td>
                      <td className="py-2.5 font-semibold">
                        {formatPrice(o.totalPrice)}
                      </td>
                      <td className="py-2.5">
                        <span className="badge bg-brand-green/10 text-brand-green">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={sec}
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FiAlertTriangle className="text-yellow-500" /> Low Stock
          </h3>
          {!stats.lowStock?.length ? (
            <p className="text-sm text-gray-500">All products well stocked</p>
          ) : (
            <ul className="space-y-3">
              {stats.lowStock.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="line-clamp-1">{p.name}</span>
                  <span
                    className={`badge ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
