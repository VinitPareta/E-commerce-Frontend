import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getSessionId = () => {
  let id = localStorage.getItem("ds_chat_session");
  if (!id) {
    id = "guest_" + Math.random().toString(36).substr(2, 12) + "_" + Date.now();
    localStorage.setItem("ds_chat_session", id);
  }
  return id;
};

// Generate a unique session ID for each new conversation (NOT persistent)
const generateNewSessionId = () => {
  localStorage.removeItem("ds_chat_session"); // Clear localStorage to avoid old session interference
  return "chat_" + Math.random().toString(36).substr(2, 15) + "_" + Date.now();
};

const BASE_SYSTEM_PROMPT = `You are "DS Assistant", the official AI chatbot for DS Store — a premium fashion e-commerce store in India selling Men, Women, Kids and Accessories.

YOUR ONLY JOB: Help users with DS Store related queries. Do NOT answer anything unrelated to DS Store, fashion, clothing, sizing, or shopping.

DS STORE INFORMATION:
- Website: DS Store
- Categories: Men, Women, Kids, Accessories
- Subcategories: T-Shirts, Shirts, Jeans, Dresses, Tops, Shoes, Bags, Watches
- Features: Shop, Cart, Wishlist, My Orders, Profile, Checkout, Payment (Stripe & Razorpay)
- Free shipping on orders above ₹1000
- 7-day return policy
- Secure payment — Stripe and Razorpay

PAGES & NAVIGATION:
- Home: / — Featured products, Trending, Outfit Complete AI
- Shop all: /shop
- Shop Men: /shop?category=Men
- Shop Women: /shop?category=Women
- Shop Kids: /shop?category=Kids
- Shop Accessories: /shop?category=Accessories
- Cart: /cart
- Wishlist: /wishlist (login required)
- My Orders: /orders (login required)
- Profile: /profile (login required)
- Checkout: /checkout (login required)
- Login: /login
- Register: /register

SIZING GUIDE (Indian standard):
- XS: Height 150-155cm, Weight 40-45kg, Chest 32", Waist 24"
- S:  Height 155-160cm, Weight 45-52kg, Chest 34", Waist 26"
- M:  Height 160-165cm, Weight 52-60kg, Chest 36", Waist 28"
- L:  Height 165-170cm, Weight 60-70kg, Chest 38", Waist 30"
- XL: Height 170-175cm, Weight 70-80kg, Chest 40", Waist 32"
- XXL:Height 175-180cm, Weight 80-90kg, Chest 42", Waist 34"

JEANS SIZING: 28=Waist 28-29", 30=Waist 30-31", 32=Waist 32-33", 34=Waist 34-35", 36=Waist 36-37"
SHOES: Under 155cm→size 5-6, 155-165cm→size 6-7, 165-175cm→size 7-9, Above 175cm→size 9-11

OUTFIT SUGGESTIONS: When user gives height + weight + preference, suggest a complete outfit with sizes.

ABUSIVE LANGUAGE RULE: If user uses any abusive, offensive, or rude language, respond politely: "I understand you might be frustrated, but I'm here to help! 😊 Please keep our conversation respectful and I'll do my best to assist you with your DS Store queries."

UNRELATED QUESTIONS RULE: For anything not related to DS Store or fashion say: "I can only help with DS Store related questions! 😊 Is there something about our store, products, or your orders I can help with?"

COMMON QUESTIONS:
- Check orders: Go to /orders (login required). Click any order for full details and tracking.
- Returns: 7-day return policy. Contact from your order details page.
- Payment safe: Yes — Stripe and Razorpay, 100% secure.
- Wishlist: Click heart icon on any product. Login required.
- Free shipping: Orders above ₹1000. Below ₹1000 = ₹99 shipping charge.
- Outfit AI: Home page → scroll down → "Outfit Complete AI" → select product → click Complete Outfit. Login required.
- Delivery time: 3-7 business days.
- No physical store yet — online only.
- No Instagram/social media yet — coming soon!
- No mobile app yet — coming soon!

RULES:
- Only answer DS Store / fashion related questions
- Keep responses short, friendly, use bullet points for steps
- Add relevant emojis
- Never make up product prices or availability
- Respond in same language as user (English, Hindi, Hinglish)

IMPORTANT:
Format responses using Markdown.

Use:
- Bullet points
- Bold text
- Short paragraphs

`;

export default function DSChatbot() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(() => generateNewSessionId());

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi${user ? " " + user.name?.split(" ")[0] : ""}! 👋 I'm **DS Assistant** — your personal shopping guide.\n\nI can help you with:\n- 👗 Outfit suggestions based on your size\n- 📦 Checking your orders\n- 📏 Size recommendations\n- 🛍️ Navigating the store\n\nWhat can I help you with today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [userOrders, setUserOrders] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch orders once when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("ds_token");
      fetch(`${API_BASE}/api/orders/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setUserOrders(data.orders || data || []))
        .catch(() => {});
    } else {
      setUserOrders([]);
    }
  }, [isAuthenticated]);

  // Update greeting when user logs in
  useEffect(() => {
    if (user && messages.length === 1) {
      setMessages([
        {
          role: "assistant",
          content: `Hi ${user.name?.split(" ")[0]}! 👋 I'm **DS Assistant** — your personal shopping guide.\n\nI can help you with:\n- 👗 Outfit suggestions based on your size\n- 📦 Checking your orders\n- 📏 Size recommendations\n- 🛍️ Navigating the store\n\nWhat can I help you with today?`,
        },
      ]);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Build dynamic system prompt with user context + orders
  const buildSystemPrompt = (userText) => {
    let prompt = BASE_SYSTEM_PROMPT;

    // Add login status
    prompt += `\n\n=== CURRENT USER CONTEXT ===`;
    prompt += `\nLogin status: ${isAuthenticated ? "LOGGED IN" : "NOT LOGGED IN"}`;

    if (isAuthenticated && user) {
      prompt += `\nUser name: ${user.name}`;
      prompt += `\nUser email: ${user.email}`;
    }

    // Add order history if user is logged in and asking about orders
    const orderKeywords = [
      "order",
      "bought",
      "purchased",
      "previous",
      "history",
      "last order",
      "suggest based",
      "recommend",
      "what i ordered",
      "reorder",
      "past",
    ];
    const isAskingAboutOrders = orderKeywords.some((k) =>
      userText.toLowerCase().includes(k),
    );

    if (!isAuthenticated && isAskingAboutOrders) {
      prompt += `\n\nIMPORTANT: The user is asking about orders but is NOT logged in. You MUST tell them: "To view your orders or get personalized suggestions based on your purchase history, you'll need to login first! 🔐 Head to /login and come back — I'll be right here! 👋"`;
    }

    if (isAuthenticated && isAskingAboutOrders) {
      if (userOrders.length === 0) {
        prompt += `\n\nUser has no orders yet. Tell them they haven't placed any orders yet and suggest browsing /shop.`;
      } else {
        const recent = userOrders.slice(0, 5);
        const orderDetails = recent
          .map((o) => {
            const items = o.items
              ?.map(
                (i) =>
                  `"${i.name}" (Color: ${i.color || "N/A"}, Size: ${i.size || "N/A"}, Qty: ${i.quantity}, Price: ₹${i.price})`,
              )
              .join(", ");
            return `- Order #${o._id?.slice(-6)}: ${items} | Status: ${o.status} | Total: ₹${o.totalPrice}`;
          })
          .join("\n");

        prompt += `\n\nUSER'S ORDER HISTORY (use this to give personalized suggestions):
${orderDetails}

IMPORTANT INSTRUCTIONS FOR ORDER-BASED SUGGESTIONS:
1. Reference the EXACT product names from their orders above
2. Suggest complementary items they haven't bought yet
3. If they bought a top, suggest matching bottoms/shoes/accessories
4. If they bought jeans, suggest matching tops or shoes
5. Be specific — say "Since you bought [product name], you might also like..."
6. Use their purchase history to understand their style preference`;
      }
    }

    return prompt;
  };

  const callAPI = async (messagesToSend, userText) => {
    const systemPrompt = buildSystemPrompt(userText);

    console.log("📤 Sending chat with sessionId:", sessionId);

    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messagesToSend.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        systemPrompt,
        sessionId,
        userId: user?._id || null,
        userName: user?.name || "Guest",
        userEmail: user?.email || "",
        isGuest: !isAuthenticated,
        userMessage: userText,
      }),
    });

    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't process that. Please try again! 🙏"
    );
  };

  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await callAPI(newMessages, text);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (!open) setUnread((u) => u + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again! 🙏",
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

  const formatMessage = (text) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const formatted = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
      );
      if (line.startsWith("- ")) {
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              marginTop: 4,
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: "#c75b7a", flexShrink: 0, marginTop: 2 }}>
              •
            </span>
            <span>{formatted.slice(2)}</span>
          </div>
        );
      }
      if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
      return (
        <div key={i} style={{ marginTop: i === 0 ? 0 : 2 }}>
          {formatted}
        </div>
      );
    });
  };

  const extractNavPaths = (content) => {
    const paths = content.match(/\/[a-z?=&]+/g) || [];
    return [...new Set(paths)].filter((p) =>
      [
        "/shop",
        "/orders",
        "/cart",
        "/wishlist",
        "/profile",
        "/login",
        "/register",
      ].some((r) => p.startsWith(r)),
    );
  };

  const quickReplies = [
    "What's my size? I'm 165cm, 60kg",
    "Suggest a casual cotton outfit",
    "How do I check my orders?",
    "Do you have free shipping?",
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #c75b7a, #e8704a)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(199,91,122,0.45)",
          color: "#fff",
          fontSize: 22,
        }}
      >
        {open ? "✕" : "💬"}
        {!open && unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#e53935",
              color: "#fff",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unread}
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              bottom: 90,
              right: 24,
              zIndex: 1000,
              width: 360,
              maxWidth: "calc(100vw -  32px)",
              height: 520,
              maxHeight: "calc(100vh - 180px)",
              background: "#fff",
              borderRadius: 20,
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(199,91,122,0.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #1a1a1a, #2d1a22)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #c75b7a, #e8704a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                🛍️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  DS Assistant
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#4caf50",
                      display: "inline-block",
                    }}
                  />
                  {isAuthenticated
                    ? `Hi, ${user?.name?.split(" ")[0]}!`
                    : "Always here to help"}
                </div>
              </div>
              <button
                onClick={() => {
                  // Start a new chat - generate new session ID and reset messages
                  const newSessionId = generateNewSessionId();
                  console.log(
                    "🆕 Starting new conversation with sessionId:",
                    newSessionId,
                  );
                  setSessionId(newSessionId);
                  setMessages([
                    {
                      role: "assistant",
                      content: `Hi${user ? " " + user.name?.split(" ")[0] : ""}! 👋 I'm **DS Assistant** — your personal shopping guide.\n\nI can help you with:\n- 👗 Outfit suggestions based on your size\n- 📦 Checking your orders\n- 📏 Size recommendations\n- 🛍️ Navigating the store\n\nWhat can I help you with today?`,
                    },
                  ]);
                }}
                title="Start a new conversation"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: "pointer",
                  padding: "4px 8px",
                  fontSize: 12,
                  marginRight: 8,
                }}
              >
                ➕
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: "pointer",
                  padding: "4px 8px",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "#fafafa",
              }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    gap: 8,
                    alignItems: "flex-end",
                  }}
                >
                  {msg.role === "assistant" && (
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #c75b7a, #e8704a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        flexShrink: 0,
                        marginBottom: 2,
                      }}
                    >
                      🛍️
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "10px 13px",
                      borderRadius:
                        msg.role === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, #c75b7a, #e8704a)"
                          : "#fff",
                      color: msg.role === "user" ? "#fff" : "#1a1a1a",
                      fontSize: 13,
                      lineHeight: 1.7,
                      textAlign: "left",
                      boxShadow:
                        msg.role === "user"
                          ? "0 2px 12px rgba(199,91,122,0.3)"
                          : "0 2px 8px rgba(0,0,0,0.06)",
                      border:
                        msg.role === "assistant" ? "1px solid #f0e8e8" : "none",
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                    {msg.role === "assistant" &&
                      (() => {
                        const paths = extractNavPaths(msg.content);
                        if (!paths.length) return null;
                        return (
                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            {paths.slice(0, 3).map((path) => (
                              <button
                                key={path}
                                onClick={() => {
                                  navigate(path);
                                  setOpen(false);
                                }}
                                style={{
                                  fontSize: 11,
                                  padding: "3px 10px",
                                  borderRadius: 20,
                                  background: "#fdf0f3",
                                  border: "1px solid #f0c0cc",
                                  color: "#c75b7a",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                }}
                              >
                                Go to {path} →
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                  </div>
                </motion.div>
              ))}

              {/* Quick replies */}
              {messages.length === 1 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        fontSize: 11,
                        padding: "5px 11px",
                        borderRadius: 20,
                        background: "#fff",
                        border: "1px solid #e8d0d8",
                        color: "#c75b7a",
                        cursor: "pointer",
                        fontWeight: 500,
                        lineHeight: 1.4,
                        textAlign: "left",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading dots */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #c75b7a, #e8704a)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    🛍️
                  </div>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#fff",
                      borderRadius: "18px 18px 18px 4px",
                      border: "1px solid #f0e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      display: "flex",
                      gap: 4,
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: i * 0.15,
                        }}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#c75b7a",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "10px 12px",
                borderTop: "1px solid #f0e8e8",
                display: "flex",
                gap: 8,
                alignItems: "flex-end",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything about DS Store…"
                rows={1}
                style={{
                  flex: 1,
                  border: "1.5px solid #e8d0d8",
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 13,
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                  maxHeight: 80,
                  overflowY: "auto",
                  color: "#1a1a1a",
                  background: "#fafafa",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#c75b7a")}
                onBlur={(e) => (e.target.style.borderColor = "#e8d0d8")}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "none",
                  background:
                    input.trim() && !loading
                      ? "linear-gradient(135deg, #c75b7a, #e8704a)"
                      : "#e0e0e0",
                  color: "#fff",
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
