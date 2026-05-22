import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiArrowRight } from "react-icons/fi";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  formatPrice,
  getEffectivePrice,
  buildImageUrl,
} from "../utils/helpers";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, totals, refresh } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.address?.fullName || user?.name || "",
    phone: user?.address?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    country: user?.address?.country || "India",
    paymentMethod: "COD",
  });

  if (cart.items.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <h2 className="heading text-2xl">Your cart is empty</h2>
        <Link to="/shop" className="btn-primary mt-5 inline-flex">
          Shop Now
        </Link>
      </div>
    );
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "fullName",
      "phone",
      "street",
      "city",
      "state",
      "pincode",
    ];
    for (const field of requiredFields) {
      if (!form[field].trim()) {
        toast.error(`Please enter ${field}`);
        return;
      }
    }
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit phone");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    try {
      setSubmitting(true);
      const items = cart.items.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      }));

      const { data } = await api.post("/orders", {
        items,
        shippingAddress: { ...form },
        paymentMethod: form.paymentMethod,
        shippingPrice: totals.shipping,
        taxPrice: totals.tax,
      });

      // ── COD: go to /payment-successful page directly ──
      if (form.paymentMethod === "COD") {
        await refresh();
        navigate("/payment-successful", { state: { order: data.order } });
        return;
      }

      // Card / UPI: redirect to Stripe ──
      // Stripe will redirect back to /payment-successful?session_id=xxx
      // Make sure your Stripe session success_url is set to:
      // `${window.location.origin}/payment-successful?session_id={CHECKOUT_SESSION_ID}`
      const orderId = data.order._id;
      const session = await api.post("/payments/stripe/session", { orderId });
      window.location.href = session.data.url;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app py-8">
      <h1 className="heading">Checkout</h1>
      <p className="mt-1 text-sm text-gray-500">Review and place your order</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card-glass p-6">
            <h3 className="text-lg font-semibold">Shipping Address</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="10-digit"
                  required
                />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <div className="mt-4 space-y-2">
              {["COD", "Card", "UPI"].map((p) => (
                <label
                  key={p}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                    form.paymentMethod === p
                      ? "border-brand-green bg-brand-green-soft/40 dark:bg-brand-green/10"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={p}
                    checked={form.paymentMethod === p}
                    onChange={handleChange}
                    className="accent-brand-green"
                  />
                  <span className="font-medium">
                    {p === "COD"
                      ? "Cash on Delivery"
                      : p === "Card"
                        ? "Credit/Debit Card"
                        : "UPI"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="self-start lg:sticky lg:top-24"
        >
          <div className="card-glass p-6">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={buildImageUrl(item.product?.images?.[0])}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(
                      getEffectivePrice(item.product) * item.quantity,
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-dashed border-gray-300 pt-4 text-sm dark:border-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">
                  {formatPrice(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold">
                  {totals.shipping === 0
                    ? "FREE"
                    : formatPrice(totals.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span className="font-semibold">{formatPrice(totals.tax)}</span>
              </div>
              <div className="my-2 border-t border-dashed border-gray-300 dark:border-gray-600" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-brand-green">
                  {formatPrice(totals.total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-5 w-full"
            >
              {submitting ? "Placing order…" : "Place Order"}{" "}
              {!submitting && <FiArrowRight />}
            </button>
          </div>
        </motion.aside>
      </form>
    </div>
  );
};

export default Checkout;
