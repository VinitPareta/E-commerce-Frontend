import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiLogOut,
  FiGrid,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totals } = useCart();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const onDocMouseDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [accountOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setOpen(false);
    }
  };

  const links = [
    { name: "Home", to: "/" },
    { name: "Shop", to: "/shop" },
    { name: "Men", to: "/shop?category=Men" },
    { name: "Women", to: "/shop?category=Women" },
    { name: "Accessories", to: "/shop?category=Accessories" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-200/60 bg-white/80 backdrop-blur-md shadow-sm dark:bg-brand-black/80 dark:border-white/10"
          : "bg-white dark:bg-brand-black"
      }`}
    >
      <div className="container-app flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-pink to-brand-pink-dark text-sm font-extrabold text-white shadow-soft md:h-10 md:w-10">
            DS
          </div>
          <span className="font-display text-xl font-bold tracking-tight md:text-2xl">
            DS Store
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.name}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition hover:text-brand-pink ${
                  isActive ? "text-brand-pink" : ""
                }`
              }
            >
              {l.name}
            </NavLink>
          ))}
        </nav>

        <form
          onSubmit={handleSearch}
          className="hidden flex-1 max-w-sm items-center md:flex"
        >
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="btn-ghost p-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          {isAuthenticated && (
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                className={`btn-ghost p-2 ${accountOpen ? "text-brand-pink" : ""}`}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
              >
                <FiUser className="text-lg md:text-xl" />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-xl dark:border-white/10 dark:bg-brand-black-soft"
                  >
                    <div className="border-b border-gray-100 p-4 dark:border-white/10">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    <div className="p-1" role="menu">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-brand-pink-soft dark:hover:bg-brand-black"
                        onClick={() => setAccountOpen(false)}
                        role="menuitem"
                      >
                        <FiUser /> Profile details
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-brand-pink-soft dark:hover:bg-brand-black"
                        onClick={() => setAccountOpen(false)}
                        role="menuitem"
                      >
                        <FiShoppingBag /> My orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-pink hover:bg-brand-pink-soft dark:hover:bg-brand-black"
                          onClick={() => setAccountOpen(false)}
                          role="menuitem"
                        >
                          <FiGrid /> Admin Panel
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setAccountOpen(false);
                          navigate("/");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        role="menuitem"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <Link
            to="/wishlist"
            className="relative btn-ghost p-2"
            aria-label="Wishlist"
          >
            <FiHeart />
            {wishlist?.products?.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink text-[10px] font-bold text-white">
                {wishlist.products.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative btn-ghost p-2" aria-label="Cart">
            <FiShoppingBag />
            {totals.count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink text-[10px] font-bold text-white">
                {totals.count}
              </span>
            )}
          </Link>

          {!isAuthenticated && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="btn-ghost px-3 py-2 text-sm font-semibold"
              >
                Login
              </Link>
              <Link to="/register" className="btn-primary px-3 py-2 text-sm">
                Register
              </Link>
            </div>
          )}

          <button
            className="btn-ghost p-2 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200/60 bg-white lg:hidden dark:bg-brand-black dark:border-white/10"
          >
            <div className="container-app space-y-2 py-4">
              <form onSubmit={handleSearch} className="md:hidden">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </form>
              {links.map((l) => (
                <NavLink
                  key={l.name}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-brand-pink-soft ${
                      isActive ? "text-brand-pink" : ""
                    } dark:hover:bg-brand-black-soft`
                  }
                >
                  {l.name}
                </NavLink>
              ))}

              <div className="pt-2 border-t border-gray-200/60 dark:border-white/10">
                {isAuthenticated ? (
                  <>
                    <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Account
                    </p>
                    <NavLink
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-brand-pink-soft dark:hover:bg-brand-black-soft"
                    >
                      Profile details
                    </NavLink>
                    <NavLink
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-brand-pink-soft dark:hover:bg-brand-black-soft"
                    >
                      My orders
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-4 py-2 text-sm font-medium text-brand-pink transition hover:bg-brand-pink-soft dark:hover:bg-brand-black-soft"
                      >
                        Admin Panel
                      </NavLink>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setOpen(false);
                        navigate("/");
                      }}
                      className="block w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 px-4">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="btn-ghost flex w-full items-center justify-center gap-2 py-2"
                    >
                      <FiUser /> Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="btn-primary flex w-full items-center justify-center py-2"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
