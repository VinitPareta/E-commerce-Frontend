import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { buildImageUrl } from "../utils/helpers";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

const COLOR_MAP = {
  black: "#1a1a1a",
  white: "#f5f5f5",
  red: "#e53935",
  blue: "#1e88e5",
  navy: "#1a237e",
  green: "#43a047",
  pink: "#e91e8c",
  purple: "#8e24aa",
  yellow: "#fdd835",
  orange: "#fb8c00",
  brown: "#6d4c41",
  grey: "#9e9e9e",
  gray: "#9e9e9e",
  beige: "#d7ccc8",
  cream: "#fff9c4",
  maroon: "#880e4f",
  gold: "#ffc107",
  silver: "#bdbdbd",
  multicolor: "linear-gradient(135deg,#e91e8c,#1e88e5,#43a047)",
};
const toHex = (c) => {
  if (!c) return "#aaa";
  const lower = c.toLowerCase().trim();
  if (lower.startsWith("#")) return lower;
  return COLOR_MAP[lower] || "#aaa";
};

function mapProduct(p) {
  const subCat = (p.subCategory || "").toLowerCase();
  const cat = (p.category || "").toLowerCase();
  let displayCategory = "other";
  if (["t-shirts", "shirts", "tops", "dresses"].includes(subCat))
    displayCategory = "tops";
  else if (["jeans"].includes(subCat)) displayCategory = "bottoms";
  else if (["shoes"].includes(subCat)) displayCategory = "footwear";
  else if (["bags", "watches"].includes(subCat))
    displayCategory = "accessories";
  else if (cat === "accessories") displayCategory = "accessories";

  const emojiMap = {
    "t-shirts": "👕",
    shirts: "👔",
    tops: "👚",
    dresses: "👗",
    jeans: "👖",
    shoes: "👟",
    bags: "👜",
    watches: "⌚",
    other: "🧥",
  };

  return {
    id: p._id,
    name: p.name,
    category: displayCategory,
    subCategory: p.subCategory || "Other",
    price: p.discountPrice > 0 ? p.discountPrice : p.price,
    originalPrice: p.price,
    colors: p.colors?.length ? p.colors : ["#888"],
    images: p.images || [],
    emoji: emojiMap[subCat] || "👕",
    tags: [cat, subCat, ...(p.colors || [])]
      .filter(Boolean)
      .map((t) => t.toLowerCase()),
    brand: p.brand || "DS Store",
    inStock: p.inStock !== false && p.stock > 0,
    sizes: p.sizes || [],
  };
}

const CATEGORY_LABELS = {
  all: "All",
  tops: "Tops",
  bottoms: "Bottoms",
  footwear: "Footwear",
  accessories: "Accessories",
  other: "Other",
};

function LoginGate({ navigate }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(6px)",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 36 }}>🔒</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
        Login to use Outfit Complete AI
      </div>
      <div
        style={{ fontSize: 13, color: "#666", maxWidth: 260, lineHeight: 1.6 }}
      >
        This feature is available for logged-in users. Sign in to get AI-curated
        outfits from our store.
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 24px",
            borderRadius: 22,
            border: "none",
            background: "linear-gradient(135deg, #c75b7a, #e8704a)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "10px 24px",
            borderRadius: 22,
            border: "1.5px solid #c75b7a",
            background: "#fff",
            color: "#c75b7a",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}

function ProductCard({ item, isSelected, onSelect, isAuthenticated }) {
  return (
    <div
      onClick={onSelect}
      title={!isAuthenticated ? "Login to use this feature" : ""}
      style={{
        border: isSelected ? "2px solid #c75b7a" : "1.5px solid #e8e0d8",
        borderRadius: 14,
        padding: "12px 10px",
        cursor: isAuthenticated ? "pointer" : "not-allowed",
        background: isSelected ? "#fdf5f7" : "#fff",
        transition: "all 0.18s",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        opacity: item.inStock ? 1 : 0.5,
      }}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#c75b7a",
            borderRadius: "50%",
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          ✓
        </div>
      )}
      {item.images?.[0] ? (
        <img
          src={buildImageUrl(item.images[0])}
          alt={item.name}
          style={{
            width: "100%",
            height: 80,
            objectFit: "cover",
            borderRadius: 8,
          }}
          onError={(e) => {
            e.target.src = "https://placehold.co/200x200/FFE0EC/D63A75?text=DS";
          }}
        />
      ) : (
        <div style={{ fontSize: 30, textAlign: "center" }}>{item.emoji}</div>
      )}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {item.colors.slice(0, 3).map((c, i) => (
          <div
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: toHex(c),
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "#1a1a1a",
          lineHeight: 1.3,
        }}
      >
        {item.name}
      </div>
      <div style={{ fontSize: 11, color: "#888" }}>
        ₹{item.price.toLocaleString()}
      </div>
      {!item.inStock && (
        <span style={{ fontSize: 10, color: "#e53935", fontWeight: 600 }}>
          Out of stock
        </span>
      )}
    </div>
  );
}

function OutfitCard({ item, reason, onAdd, adding }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #e8e0d8",
        borderRadius: 16,
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #c75b7a, #e8a04a)",
        }}
      />
      {item.images?.[0] ? (
        <img
          src={buildImageUrl(item.images[0])}
          alt={item.name}
          style={{
            width: "100%",
            height: 110,
            objectFit: "cover",
            borderRadius: 10,
          }}
          onError={(e) => {
            e.target.src = "https://placehold.co/300x300/FFE0EC/D63A75?text=DS";
          }}
        />
      ) : (
        <div style={{ fontSize: 32, textAlign: "center" }}>{item.emoji}</div>
      )}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#1a1a1a",
          lineHeight: 1.3,
        }}
      >
        {item.name}
      </div>
      <div style={{ fontSize: 11, color: "#888" }}>
        {item.brand} · ₹{item.price.toLocaleString()}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#777",
          fontStyle: "italic",
          background: "#fdf8f5",
          borderRadius: 8,
          padding: "6px 8px",
          lineHeight: 1.5,
        }}
      >
        "{reason}"
      </div>
      {!item.inStock ? (
        <span
          style={{
            marginTop: 2,
            fontSize: 11,
            padding: "6px 0",
            borderRadius: 20,
            background: "#fef2f2",
            color: "#e53935",
            fontWeight: 600,
            textAlign: "center",
            border: "1px solid #fecaca",
            display: "block",
          }}
        >
          Out of Stock — not added to cart
        </span>
      ) : (
        <button
          onClick={onAdd}
          disabled={adding}
          style={{
            marginTop: 2,
            fontSize: 12,
            padding: "7px 14px",
            borderRadius: 20,
            border: "none",
            background: adding ? "#e8f5e9" : "#c75b7a",
            color: adding ? "#2e7d32" : "#fff",
            fontWeight: 700,
            cursor: adding ? "default" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {adding ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      )}
    </div>
  );
}

export default function OutfitCompleteAI() {
  const { isAuthenticated } = useAuth();
  const { addToCart, refresh } = useCart();
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [outfitResult, setOutfitResult] = useState(null);
  const [generatingOutfit, setGeneratingOutfit] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [addingIds, setAddingIds] = useState([]);
  const [addedAll, setAddedAll] = useState(false);

  const loadingMessages = [
    "Analysing style and colour palette…",
    "Matching with your catalog…",
    "Curating the perfect outfit…",
    "Adding the finishing touches…",
  ];

  useEffect(() => {
    fetch(`${API_BASE}/api/products?limit=60`)
      .then((r) => r.json())
      .then((data) => {
        const raw = Array.isArray(data)
          ? data
          : data.products || data.data || [];
        setCatalog(raw.map(mapProduct));
      })
      .catch(() =>
        setError("Could not load products. Make sure your server is running."),
      )
      .finally(() => setLoadingProducts(false));
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(catalog.map((p) => p.category))).filter(
      (c) => c !== "other",
    ),
  ];
  const filteredCatalog =
    filterCat === "all"
      ? catalog
      : catalog.filter((i) => i.category === filterCat);

  const handleAddToCart = async (item) => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }
    if (!item.inStock) {
      toast.error(`${item.name} is out of stock`);
      return;
    }
    setAddingIds((prev) => [...prev, item.id]);
    await addToCart(item.id, 1, item.sizes?.[0] || "", item.colors?.[0] || "");
  };

  const handleAddAllToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }
    const allItems = [selectedItem, ...outfitResult.map((p) => p.item)];
    const inStockItems = allItems.filter((item) => item.inStock);
    const token = localStorage.getItem("ds_token");

    for (const item of inStockItems) {
      await fetch(`${API_BASE}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: 1,
          size: item.sizes?.[0] || "",
          color: item.colors?.[0] || "",
        }),
      });
    }

    await refresh();
    toast.success(
      `${inStockItems.length} item${inStockItems.length > 1 ? "s" : ""} added to cart! 🛒`,
      { duration: 3000 },
    );
    setAddedAll(true);
  };

  const generateOutfit = async () => {
    if (!selectedItem || !isAuthenticated) return;
    setGeneratingOutfit(true);
    setOutfitResult(null);
    setError("");
    setAddedAll(false);
    setAddingIds([]);

    let msgIdx = 0;
    setLoadingMsg(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[msgIdx]);
    }, 1800);

    // Use index-based approach so AI cannot hallucinate wrong IDs
    const eligibleProducts = catalog.filter((i) => i.id !== selectedItem.id);

    // Detect gender from DB category stored in tags
    const selectedGender =
      selectedItem.tags?.find((t) => ["men", "women", "kids"].includes(t)) ||
      "unisex";

    const catalogDesc = eligibleProducts
      .map((i, idx) => {
        const gender =
          i.tags?.find((t) => ["men", "women", "kids"].includes(t)) || "unisex";
        return `INDEX:${idx} | ${i.name} | Gender:${gender} | SubCategory:${i.subCategory} | Colors:${i.colors.join(",")} | Price:₹${i.price}`;
      })
      .join("\n");

    const prompt = `You are a fashion stylist AI for DS Store, a premium fashion brand in India.

SELECTED ITEM: "${selectedItem.name}"
- Gender target: ${selectedGender}
- SubCategory: ${selectedItem.subCategory}
- Colors: ${selectedItem.colors.join(",")}
- Price: ₹${selectedItem.price}

STRICT RULES — YOU MUST FOLLOW ALL OF THESE:
1. GENDER MATCH: Only pick items where Gender matches "${selectedGender}". NEVER suggest women's items for a men's selection or vice versa. Accessories (Bags, Watches) are unisex and always allowed.
2. NO DUPLICATE SUBCATEGORY: Do not pick another item of the same SubCategory as the selected item.
3. VARIETY: Pick 3 items from 3 different SubCategories to complete the outfit.
4. COLOR HARMONY: Pick colors that match or complement ${selectedItem.colors.join(",")}.

CATALOG (use ONLY the INDEX numbers below):
${catalogDesc}

Respond ONLY with a valid JSON array of exactly 3 objects. No markdown, no explanation, just raw JSON.
Each object must have:
- "index": number (the INDEX number from catalog above)
- "reason": string (one short sentence max 12 words, why it pairs well)

Example: [{"index":2,"reason":"These slim jeans complement the t-shirt perfectly."},{"index":5,"reason":"White sneakers keep the casual look fresh."},{"index":9,"reason":"This watch adds a clean finishing touch."}]`;

    try {
      const res = await fetch(`${API_BASE}/api/ai/outfit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      // Support GROQ (groqText), OpenAI/GROQ choices format, and Gemini candidates format
      const raw =
        data?.groqText ||
        data?.choices?.[0]?.message?.content ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "";

      if (!raw) throw new Error("Empty AI response");

      const jsonMatch = raw.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) throw new Error("No JSON in response");

      const parsed = JSON.parse(jsonMatch[0]);

      const picks = parsed
        .map((p) => ({
          item: eligibleProducts[p.index],
          reason: p.reason,
        }))
        .filter((p) => p.item);

      if (picks.length === 0) throw new Error("No matches found");
      setOutfitResult(picks);
    } catch (e) {
      setError(
        `Couldn't generate outfit right now. ${e.message || "Please try again."}`,
      );
    } finally {
      clearInterval(interval);
      setGeneratingOutfit(false);
      setLoadingMsg("");
    }
  };

  const totalOutfitPrice = outfitResult
    ? selectedItem.price + outfitResult.reduce((s, p) => s + p.item.price, 0)
    : 0;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        maxWidth: 920,
        margin: "0 auto",
        padding: "0 0 48px",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d1a22 100%)",
          padding: "28px 28px 24px",
          borderRadius: "0 0 24px 24px",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 22 }}>✨</span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            Outfit Complete AI
          </span>
          <span
            style={{
              marginLeft: "auto",
              background: "#c75b7a",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.05em",
            }}
          >
            DS STORE
          </span>
        </div>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          Pick any item — AI instantly completes your outfit with perfectly
          matched pieces from our store.
        </p>
        {!isAuthenticated && (
          <div
            style={{
              marginTop: 12,
              background: "rgba(199,91,122,0.15)",
              border: "1px solid rgba(199,91,122,0.3)",
              borderRadius: 10,
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ color: "#f0a0b8", fontSize: 12 }}>
              Login to use this AI feature —{" "}
              <span
                onClick={() => navigate("/login")}
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Sign in now
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "0 16px", position: "relative" }}>
        {!isAuthenticated && <LoginGate navigate={navigate} />}

        {/* Step 1 */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: selectedItem ? "#c75b7a" : "#1a1a1a",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {selectedItem ? "✓" : "1"}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>
              Choose a product to start with
            </span>
          </div>

          {/* Category Filter */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => isAuthenticated && setFilterCat(cat)}
                style={{
                  fontSize: 12,
                  padding: "5px 14px",
                  borderRadius: 20,
                  border: filterCat === cat ? "none" : "1.5px solid #e0d8d0",
                  background: filterCat === cat ? "#1a1a1a" : "#fff",
                  color: filterCat === cat ? "#fff" : "#555",
                  fontWeight: 600,
                  cursor: isAuthenticated ? "pointer" : "default",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {loadingProducts ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#888",
                fontSize: 13,
              }}
            >
              Loading products…
            </div>
          ) : catalog.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#c0392b",
                fontSize: 13,
              }}
            >
              {error || "No products found."}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 10,
              }}
            >
              {filteredCatalog.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  isAuthenticated={isAuthenticated}
                  onSelect={() => {
                    if (!isAuthenticated) return;
                    setSelectedItem(item);
                    setOutfitResult(null);
                    setError("");
                    setAddedAll(false);
                    setAddingIds([]);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Step 2 */}
        {selectedItem && isAuthenticated && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: outfitResult ? "#c75b7a" : "#1a1a1a",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {outfitResult ? "✓" : "2"}
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>
                Complete your outfit
              </span>
            </div>

            <div
              style={{
                background: "#fdf5f7",
                border: "1.5px dashed #e8b0c0",
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              {selectedItem.images?.[0] ? (
                <img
                  src={buildImageUrl(selectedItem.images[0])}
                  alt={selectedItem.name}
                  style={{
                    width: 52,
                    height: 52,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <span style={{ fontSize: 32 }}>{selectedItem.emoji}</span>
              )}
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}
                >
                  {selectedItem.name}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  ₹{selectedItem.price.toLocaleString()} ·{" "}
                  {selectedItem.subCategory}
                </div>
              </div>
              <button
                onClick={generateOutfit}
                disabled={generatingOutfit}
                style={{
                  marginLeft: "auto",
                  padding: "10px 22px",
                  background: generatingOutfit
                    ? "#ddd"
                    : "linear-gradient(135deg, #c75b7a, #e8704a)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 22,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: generatingOutfit ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {generatingOutfit ? "✨ Styling…" : "✨ Complete Outfit"}
              </button>
            </div>

            {generatingOutfit && (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div
                  style={{
                    fontSize: 32,
                    marginBottom: 10,
                    animation: "spin 1.5s linear infinite",
                    display: "inline-block",
                  }}
                >
                  ✨
                </div>
                <div
                  style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}
                >
                  {loadingMsg}
                </div>
                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "#fff0f0",
                  border: "1px solid #ffcccc",
                  borderRadius: 10,
                  padding: "12px 16px",
                  color: "#c0392b",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {outfitResult && isAuthenticated && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#c75b7a",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                3
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>
                Your complete outfit
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {outfitResult.map(({ item, reason }) => (
                <OutfitCard
                  key={item.id}
                  item={item}
                  reason={reason}
                  adding={addingIds.includes(item.id)}
                  onAdd={() => handleAddToCart(item)}
                />
              ))}
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #1a1a1a, #2d1a22)",
                borderRadius: 16,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>
                  Complete outfit total
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
                  ₹{totalOutfitPrice.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "#888" }}>
                  {outfitResult.length + 1} pieces · curated by AI
                </div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => {
                    setOutfitResult(null);
                    setAddedAll(false);
                    setAddingIds([]);
                  }}
                  style={{
                    padding: "11px 20px",
                    borderRadius: 22,
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    background: "transparent",
                    color: "#ccc",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ↺ Try Again
                </button>
                <button
                  onClick={handleAddAllToCart}
                  disabled={addedAll}
                  style={{
                    padding: "11px 24px",
                    borderRadius: 22,
                    border: "none",
                    background: addedAll
                      ? "#e8f5e9"
                      : "linear-gradient(135deg, #c75b7a, #e8704a)",
                    color: addedAll ? "#2e7d32" : "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: addedAll ? "default" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {addedAll ? "✓ All Added to Cart" : "🛒 Add All to Cart"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
