import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiLock, FiLogIn, FiMail } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      if (user.role !== "admin") {
        logout();
        toast.error("Admin access only");
        navigate("/", { replace: true });
        return;
      }
      navigate(from.startsWith("/admin") ? from : "/admin", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app flex min-h-screen items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card-glass p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-black to-brand-black-soft text-lg font-extrabold text-white shadow-soft">
              DS
            </div>
            <h1 className="font-display text-3xl font-bold">Admin Login</h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to manage products, orders, and users
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@company.com"
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <FiLogIn />}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/" className="text-gray-500 hover:underline">
              Back to store
            </Link>
            <Link
              to="/login"
              className="font-semibold text-brand-green hover:underline"
            >
              User login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
