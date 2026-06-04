import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiLogOut,
  FiHome,
  FiMenu,
  FiSun,
  FiMoon,
  FiUser,
  FiMail,
  FiShield,
  FiChevronDown,
  FiCreditCard,
  FiZap,
  FiMessageCircle,
  FiCpu,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
// adding payment option in the sidebar
const links = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/admin/users", label: "Users", icon: FiUsers },
  { to: "/admin/payments", label: "Payments", icon: FiCreditCard },
  { to: "/admin/chats", label: "Chat Conversations", icon: FiMessageCircle },
  { to: "/admin/webhook", label: "Webhook", icon: FiZap },
  { to: "/admin/ai-assistant", label: "AI Assistant", icon: FiCpu },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200/60 bg-white dark:bg-brand-black-soft dark:border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-gray-200/60 p-5 dark:border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-brand-green-dark text-sm font-extrabold text-white shadow-soft">
          DS
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-none">
            DS Store
          </p>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 p-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-green text-white shadow-soft"
                  : "hover:bg-brand-green-soft dark:hover:bg-brand-black"
              }`
            }
          >
            <l.icon /> {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-200/60 p-3 dark:border-white/10">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-green-soft dark:hover:bg-brand-black"
        >
          <FiHome /> Visit Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-brand-green-soft/30 dark:bg-brand-black">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">{Sidebar}</div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween" }}
              className="h-full w-64"
              onClick={(e) => e.stopPropagation()}
            >
              {Sidebar}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* ── Header ── */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/60 bg-white px-4 dark:bg-brand-black-soft dark:border-white/10 lg:px-8">
          {/* Left: hamburger (mobile only) */}
          <button
            className="btn-ghost p-2 lg:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <FiMenu />
          </button>

          {/* Right: welcome + theme + avatar */}
          <div className="flex flex-1 items-center justify-end gap-3">
            <p className="hidden sm:block text-sm">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </p>

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="btn-ghost p-2">
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>

            {/* Avatar + Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full focus:outline-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <FiChevronDown
                  className={`text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                  size={14}
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{ transformOrigin: "top right" }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 bg-white shadow-xl dark:bg-brand-black-soft dark:border-white/10 overflow-hidden"
                  >
                    {/* Profile Header */}
                    <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-br from-brand-green/10 to-brand-green/5 border-b border-gray-100 dark:border-white/10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-lg font-bold text-white shadow-soft flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {user?.name}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-0.5 rounded-full bg-brand-green/15 px-2 py-0.5 text-xs font-semibold text-brand-green">
                          <FiShield size={10} /> Admin
                        </span>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="px-4 py-3 space-y-2.5">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <FiMail
                          size={14}
                          className="flex-shrink-0 text-brand-green"
                        />
                        <span className="truncate">{user?.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <FiUser
                          size={14}
                          className="flex-shrink-0 text-brand-green"
                        />
                        <span>
                          Role:{" "}
                          <strong className="text-gray-800 dark:text-white capitalize">
                            {user?.role || "admin"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-100 dark:border-white/10 px-3 py-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                      >
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
