import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import {
  FiSend,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiChevronDown,
  FiZap,
  FiTrash2,
  FiCpu,
  FiRefreshCw,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORIES = [
  {
    id: "products",
    label: "Products",
    icon: FiBox,
    color: "#10b981",
    desc: "Inventory, pricing, stock, categories",
    quickQueries: [
      "Which products are out of stock?",
      "Which products have low stock?",
      "What are the top rated products?",
      "Show me all featured products",
      "Which products should I restock first?",
    ],
  },
  {
    id: "orders",
    label: "Orders",
    icon: FiShoppingBag,
    color: "#c75b7a",
    desc: "Order status, payments, deliveries",
    quickQueries: [
      "How many orders are pending?",
      "What is the total revenue?",
      "Show me cancelled orders",
      "How many orders are delivered?",
      "Are there any unpaid orders?",
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: FiUsers,
    color: "#f59e0b",
    desc: "Customer accounts, activity, support",
    quickQueries: [
      "How many users do we have?",
      "How many users registered this month?",
      "Are there any admin accounts?",
      "Show me recently registered users",
      "Give me a user summary",
    ],
  },
];

const buildSystemPrompt = (storeData, category) => {
  const { products, orders, users, chats } = storeData; // extract the store data

  //  Products summary 
  const outOfStock = products.filter(
    (p) => p.inStock === false || p.stock === 0,
  );
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const inStock = products.filter((p) => p.inStock === true && p.stock > 0);
  const featured = products.filter((p) => p.isFeatured);
  const trending = products.filter((p) => p.isTrending);
  const prices = products
    .map((p) => (p.discountPrice > 0 ? p.discountPrice : p.price))
    .filter(Boolean);
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;
  const topRated = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);
  const categories = [...new Set(products.map((p) => p.category))];

  // Orders summary 
  const statusCount = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const paidOrders = orders.filter((o) => o.isPaid);
  const unpaidOrders = orders.filter(
    (o) => !o.isPaid && o.status !== "Cancelled",
  );
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const refundPending = orders.filter(
    (o) => o.paymentStatus === "Refund Pending",
  );
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  //Users summary
  const now = new Date();
  const thisMonthUsers = users.filter((u) => {
    const d = new Date(u.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const lastMonthUsers = users.filter((u) => {
    const d = new Date(u.createdAt);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      d.getMonth() === lastMonth.getMonth() &&
      d.getFullYear() === lastMonth.getFullYear()
    );
  });
  const adminUsers = users.filter((u) => u.role === "admin");
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return `You are "DS Admin Assistant" — an intelligent AI assistant for the DS Store admin panel.

YOU ARE TALKING TO THE STORE ADMIN. Be professional, data-driven, and concise.

!! MOST IMPORTANT RULE !!
The data below is LIVE from the database RIGHT NOW.
You MUST use these EXACT numbers and names in every answer.
NEVER say "I don't have data" or "0 users" when data is provided below.
NEVER make up numbers. NEVER use placeholder values.
If the data below says 3 users — you say 3 users.
If the data below says 5 products out of stock — you say those exact 5 names.

─────────────────────────────────────────
CURRENT CATEGORY FOCUS: ${category || "General — all data available"}
─────────────────────────────────────────

═══════════════════════════════
📦 LIVE PRODUCTS DATA
═══════════════════════════════
Total products: ${products.length}
In stock: ${inStock.length}
Out of stock: ${outOfStock.length}${outOfStock.length > 0 ? `\nOut of stock names: ${outOfStock.map((p) => `"${p.name}" (stock:${p.stock})`).join(", ")}` : ""}
Low stock (1-5 units): ${lowStock.length}${lowStock.length > 0 ? `\nLow stock names: ${lowStock.map((p) => `"${p.name}" (${p.stock} left)`).join(", ")}` : ""}
Featured products: ${featured.length} (${featured.map((p) => p.name).join(", ") || "none"})
Trending products: ${trending.length} (${trending.map((p) => p.name).join(", ") || "none"})
Categories: ${categories.join(", ")}
Price range: ₹${prices.length ? Math.min(...prices) : 0} – ₹${prices.length ? Math.max(...prices) : 0}
Average price: ₹${avgPrice}
Top rated: ${topRated.map((p) => `"${p.name}" (${p.rating || 0}⭐, ${p.numReviews || 0} reviews)`).join(", ")}
All products (name | stock | inStock | category):
${products.map((p) => `  - ${p.name} | stock:${p.stock} | inStock:${p.inStock} | ${p.category} | ₹${p.discountPrice > 0 ? p.discountPrice : p.price}`).join("\n")}

═══════════════════════════════
🛍️ LIVE ORDERS DATA
═══════════════════════════════
Total orders: ${orders.length}
Status breakdown: ${
    Object.entries(statusCount)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ") || "no orders"
  }
Total revenue (paid orders): ₹${totalRevenue.toLocaleString()}
Paid orders: ${paidOrders.length}
Unpaid orders: ${unpaidOrders.length}
Refund pending: ${refundPending.length}
Recent orders: ${recentOrders.map((o) => `#${(o._id || "").slice(-6)} (${o.status}, ₹${o.totalPrice}, ${o.isPaid ? "paid" : "unpaid"})`).join(", ") || "none"}

═══════════════════════════════
👥 LIVE USERS DATA
═══════════════════════════════
Total users: ${users.length}
Admin accounts: ${adminUsers.length} (${adminUsers.map((u) => u.name).join(", ") || "none"})
Regular customers: ${users.length - adminUsers.length}
Registered this month: ${thisMonthUsers.length}
Registered last month: ${lastMonthUsers.length}
Recent signups: ${recentUsers.map((u) => `${u.name} (${u.email}, joined ${new Date(u.createdAt).toLocaleDateString()})`).join(", ") || "none"}

═══════════════════════════════
💬 LIVE CHAT DATA
═══════════════════════════════

Total chat sessions: ${chats.length}

Recent customer chats:
${chats
  .slice(0, 10)
  .map((chat) => {
    const userMsg =
      chat.messages?.find((m) => m.role === "user")?.content ||
      chat.question ||
      "No message";
    return `- ${userMsg}`;
  })
  .join("\n")}

─────────────────────────────────────────
DS STORE INFORMATION
─────────────────────────────────────────
Store: DS Store — premium fashion, India
Payment: Stripe + Razorpay (Card, UPI, COD)
Shipping: Free above ₹1000, ₹99 below
Tax: 5% at checkout
Returns: 7 days
Delivery: 3-7 business days

Admin Panel Routes:
- Dashboard: /admin
- Products: /admin/products (add: /admin/products/new)
- Orders: /admin/orders
- Users: /admin/users
- Payments: /admin/payments
- Chat Logs: /admin/chats
- AI Assistant: /admin/ai-assistant
- Webhook: /admin/webhook

─────────────────────────────────────────
RESPONSE RULES
─────────────────────────────────────────
- Use ONLY the live data above — never generic answers
- Always mention exact product names, counts, amounts from above
- Use bullet points for lists
- Bold key numbers and names
- End every response with 1 actionable next step with a route
- Keep responses under 200 words unless admin asks for full analysis
- You have access to LIVE CUSTOMER CHAT DATA
- Analyze customer conversations when asked about improvements
- Use chat history to identify customer pain points
- Emojis: 📦 products, 🛍️ orders, 👥 users, ⚠️ warnings, ₹ prices`;
};

export default function AdminAIAssistant() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const defaultMessage = [
    {
      role: "assistant",
      content: `👋 Welcome, **${user?.name || "Admin"}**! I'm your DS Store AI Assistant.

I have access to your live store data — products, orders, users and customer chat trends.

Try asking:

- Give me a store summary
- Which products are out of stock?
- What are customers asking most?
- According to user chats what should we improve?`,
    },
  ];

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("admin_ai_chat");

    return saved ? JSON.parse(saved) : defaultMessage;
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState({
    products: [],
    orders: [],
    users: [],
    chats: [],
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const fetchStoreData = async () => {
    setDataLoading(true);
    setDataError("");
    try {
      // Fetch all three in parallel, each independently
      //   const results = await Promise.allSettled([
      //     api.get("/products?limit=500"),
      //     api.get("/orders"),
      //     api.get("/users"),
      //     // adding this
      //   ]);
      const results = await Promise.allSettled([
        api.get("/products?limit=500"),
        api.get("/orders"),
        api.get("/users"),
        api.get("/admin/chats"),
      ]);

      const pResult = results[0];
      const oResult = results[1];
      const uResult = results[2];
      const cResult = results[3];

      // Extract products
      let products = [];
      if (pResult.status === "fulfilled") {
        const d = pResult.value.data;
        products = d.products || d.data || (Array.isArray(d) ? d : []);
      }

      // Extract orders
      let orders = [];
      if (oResult.status === "fulfilled") {
        const d = oResult.value.data;
        orders = d.orders || d.data || (Array.isArray(d) ? d : []);
      }

      // Extract users — try every possible key
      let users = [];
      if (uResult.status === "fulfilled") {
        const d = uResult.value.data;
        users =
          d.users ||
          d.data ||
          d.customers ||
          d.results ||
          (Array.isArray(d) ? d : Object.values(d).find(Array.isArray) || []);
        console.log("Users:", users);
      } else {
        console.error("Users fetch failed:", uResult.reason);
      }

      // Extract chats
      let chats = [];

      if (cResult.status === "fulfilled") {
        const d = cResult.value.data;
        chats = d.chats || [];
      } else {
        console.error("Chats fetch failed:", cResult.reason);
      }

      console.log("AdminAI loaded:", {
        products: products.length,
        orders: orders.length,
        users: users.length,
        outOfStock: products
          .filter((p) => !p.inStock || p.stock === 0)
          .map((p) => p.name),
      });

      setStoreData({ products, orders, users, chats });
    } catch (e) {
      console.error("AdminAI fetch error:", e);
      setDataError("Could not load store data. Check your connection.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem("admin_ai_chat", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(
        storeData,
        selectedCategory?.label,
      );

      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt,
          sessionId: `admin_${user?._id}`,
          userId: user?._id,
          userName: user?.name,
          userEmail: user?.email,
          isGuest: false,
          userMessage: text,
        }),
      });

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't process that. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong connecting to AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    localStorage.removeItem("admin_ai_chat");

    setMessages([
      {
        role: "assistant",
        content: `👋 Chat cleared! Ready to help, **${user?.name || "Admin"}**.\n\nAsk me anything about your store data.`,
      },
    ]);
  };

  const formatMessage = (text) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const formatted = parts.map((part, j) =>
        j % 2 === 1 ? (
          <strong key={j} className="font-semibold">
            {part}
          </strong>
        ) : (
          part
        ),
      );
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <div key={i} className="flex gap-2 mt-1">
            <span className="text-brand-green mt-0.5 flex-shrink-0">•</span>
            <span>{formatted.slice(line.startsWith("- ") ? 2 : 1)}</span>
          </div>
        );
      }
      if (line.match(/^\d+\./))
        return (
          <div key={i} className="mt-1 pl-1">
            {formatted}
          </div>
        );
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return (
        <div key={i} className={i === 0 ? "" : "mt-0.5"}>
          {formatted}
        </div>
      );
    });
  };

  const activeCat = CATEGORIES.find((c) => c.id === selectedCategory?.id);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiCpu className="text-brand-green" /> AI Assistant
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
            {dataLoading ? (
              <span className="text-yellow-500">
                ⏳ Loading live store data…
              </span>
            ) : dataError ? (
              <span className="text-red-500">⚠️ {dataError}</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">
                ✅ Live data: {storeData.products.length} products ·{" "}
                {storeData.orders.length} orders · {storeData.users.length}{" "}
                users
              </span>
            )}
            <button
              onClick={fetchStoreData}
              title="Refresh data"
              className="text-gray-400 hover:text-brand-green transition"
            >
              <FiRefreshCw size={13} />
            </button>
          </p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <FiTrash2 size={14} /> Clear Chat
        </button>
      </div>

      {/* Category Selector */}
      <div className="mb-4" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setCategoryOpen((v) => !v)}
            className="flex items-center gap-3 w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-black-soft hover:border-brand-green transition text-sm font-medium"
          >
            {activeCat ? (
              <>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: activeCat.color }}
                />
                <activeCat.icon size={15} style={{ color: activeCat.color }} />
                <span>{activeCat.label}</span>
                <span className="text-gray-400 text-xs ml-1">
                  — {activeCat.desc}
                </span>
              </>
            ) : (
              <>
                <FiZap size={15} className="text-gray-400" />
                <span className="text-gray-500">
                  Select category to focus AI
                </span>
              </>
            )}
            <FiChevronDown
              size={14}
              className={`ml-auto text-gray-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {categoryOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-full sm:w-96 bg-white dark:bg-brand-black-soft rounded-2xl border border-gray-100 dark:border-white/10 shadow-xl z-20 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCategoryOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition border-b border-gray-100 dark:border-white/10 ${!selectedCategory ? "bg-brand-green/5" : ""}`}
                >
                  <FiZap size={15} className="text-brand-green" />
                  <div className="text-left">
                    <div className="font-medium">General</div>
                    <div className="text-xs text-gray-400">
                      Ask anything about your entire store
                    </div>
                  </div>
                  {!selectedCategory && (
                    <span className="ml-auto text-brand-green text-xs font-semibold">
                      Active
                    </span>
                  )}
                </button>

                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCategoryOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition border-b last:border-0 border-gray-100 dark:border-white/10 ${selectedCategory?.id === cat.id ? "bg-brand-green/5" : ""}`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: cat.color + "20" }}
                    >
                      <cat.icon size={15} style={{ color: cat.color }} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{cat.label}</div>
                      <div className="text-xs text-gray-400">{cat.desc}</div>
                    </div>
                    {selectedCategory?.id === cat.id && (
                      <span className="ml-auto text-brand-green text-xs font-semibold">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick queries */}
        {activeCat && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {activeCat.quickQueries.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-black-soft hover:border-brand-green hover:text-brand-green transition whitespace-nowrap disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-black-soft flex flex-col">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white ${msg.role === "user" ? "bg-brand-green" : "bg-gradient-to-br from-[#c75b7a] to-[#e8704a]"}`}
              >
                {msg.role === "user"
                  ? user?.name?.charAt(0).toUpperCase()
                  : "AI"}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                    ? "bg-brand-green text-white rounded-tr-sm"
                    : "bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-100 dark:border-white/10"
                }`}
              >
                {formatMessage(msg.content)}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c75b7a] to-[#e8704a] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                AI
              </div>
              <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.15,
                    }}
                    className="w-1.5 h-1.5 rounded-full bg-brand-green"
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 dark:border-white/10 p-3 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              activeCat
                ? `Ask about ${activeCat.label.toLowerCase()}…`
                : "Ask anything about your store…"
            }
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-green transition max-h-24 overflow-y-auto"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition ${input.trim() && !loading ? "bg-brand-green hover:bg-brand-green-dark text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed"}`}
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
