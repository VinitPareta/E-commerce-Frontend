import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totals } = useCart();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] =
    useState("Search products...");
  const [hovered, setHovered] = useState(false);

  const accountRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const announcements = [
    "🚚 Free Shipping on orders above ₹1000",
    "🎉 Get 20% off on your First Order!",
  ];
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  // Only show transparent/hero navbar on the home page
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((i) => (i + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const texts = [
      "Search Sneakers...",
      "Search Hoodies...",
      "Search Jackets...",
      "Search Trending Fashion...",
      "Search Premium Products...",
    ];
    let currentTextIndex = 0,
      currentCharIndex = 0,
      isDeleting = false,
      timer;
    const typingSpeed = 90,
      deletingSpeed = 45,
      pauseTime = 1800;
    const typeEffect = () => {
      const currentText = texts[currentTextIndex];
      if (!isDeleting) {
        setSearchPlaceholder(currentText.substring(0, currentCharIndex + 1));
        currentCharIndex++;
        if (currentCharIndex === currentText.length) {
          isDeleting = true;
          timer = setTimeout(typeEffect, pauseTime);
          return;
        }
      } else {
        setSearchPlaceholder(currentText.substring(0, currentCharIndex - 1));
        currentCharIndex--;
        if (currentCharIndex === 0) {
          isDeleting = false;
          currentTextIndex = (currentTextIndex + 1) % texts.length;
        }
      }
      timer = setTimeout(typeEffect, isDeleting ? deletingSpeed : typingSpeed);
    };
    timer = setTimeout(typeEffect, typingSpeed);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const onDocMouseDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target))
        setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [accountOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onDocMouseDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [searchOpen]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearch(value);
      clearTimeout(debounceRef.current);
      if (!value.trim()) {
        setIsSearching(false);
        navigate("/shop", { replace: true });
        return;
      }
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        navigate(`/shop?keyword=${encodeURIComponent(value.trim())}`, {
          replace: true,
        });
        setIsSearching(false);
      }, 500);
    },
    [navigate],
  );

  const links = [
    { name: "Home", to: "/" },
    { name: "Shop", to: "/shop" },
    { name: "Men", to: "/shop?category=Men" },
    { name: "Women", to: "/shop?category=Women" },
    { name: "Accessories", to: "/shop?category=Accessories" },
  ];

  // Transparent hero mode ONLY on home page when not scrolled and not hovered
  const isOverHero = isHomePage && !scrolled && !hovered;

  // Solid background: always on non-home pages, or when scrolled/hovered on home
  const isSolid = !isOverHero;

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full bg-brand-black text-white overflow-hidden">
        <div className="container-app flex items-center justify-between py-2 text-xs font-medium tracking-wide">
          <button
            onClick={() =>
              setAnnouncementIndex(
                (i) => (i - 1 + announcements.length) % announcements.length,
              )
            }
            className="p-1 text-white/60 hover:text-white transition"
          >
            ‹
          </button>
          <AnimatePresence mode="wait">
            <motion.p
              key={announcementIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-center text-white/90"
            >
              {announcements[announcementIndex]}
            </motion.p>
          </AnimatePresence>
          <button
            onClick={() =>
              setAnnouncementIndex((i) => (i + 1) % announcements.length)
            }
            className="p-1 text-white/60 hover:text-white transition"
          >
            ›
          </button>
        </div>
      </div>

      {/* ── Navbar ── */}
      <header
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed top-8 left-0 right-0 z-40 w-full transition-all duration-500 ${
          isSolid
            ? "bg-white/95 backdrop-blur-lg shadow-[0_2px_20px_rgba(16,185,129,0.10)] border-b border-brand-green/15 dark:bg-brand-black/95"
            : "bg-transparent"
        }`}
      >
        {/* Top green accent line */}
        <div
          className={`absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-brand-green to-transparent transition-all duration-700 ${
            isSolid ? "w-full opacity-70" : "w-0 opacity-0"
          }`}
        />

        <div className="container-app flex h-16 items-center md:h-20">
          {/* LEFT — Nav links */}
          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.name}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200 ${
                    isOverHero
                      ? isActive
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                      : isActive
                        ? "text-brand-green"
                        : "text-gray-700 hover:text-brand-green dark:text-gray-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.name}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full ${
                          isOverHero ? "bg-white" : "bg-brand-green"
                        }`}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* CENTER — Logo */}
          <div className="flex flex-1 justify-start lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:flex-none lg:justify-center">
            <Link to="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.08 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-brand-green-dark text-sm font-extrabold text-white shadow-soft md:h-10 md:w-10"
              >
                DS
              </motion.div>
              <span
                className={`font-display text-xl font-bold tracking-tight transition-colors duration-300 md:text-2xl ${
                  isOverHero ? "text-white" : "text-brand-green dark:text-white"
                }`}
              >
                DS Store
              </span>
            </Link>
          </div>

          {/* RIGHT — Actions */}
          <div className="flex flex-1 items-center justify-end gap-1">
            {/* Search */}
            <div className="relative hidden md:block" ref={searchRef}>
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.div
                    key="searchbox"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={handleSearchChange}
                        className="input pl-9 pr-8 py-2 text-sm"
                      />
                      {isSearching && (
                        <div className="absolute inset-y-0 right-3 flex items-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="searchicon"
                    onClick={() => setSearchOpen(true)}
                    className={`p-2 transition-colors ${
                      isOverHero
                        ? "text-white/80 hover:text-white"
                        : "btn-ghost"
                    }`}
                  >
                    <FiSearch className="text-lg" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 transition-colors ${
                isOverHero ? "text-white/80 hover:text-white" : "btn-ghost"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>

            {/* Account */}
            {isAuthenticated && (
              <div className="relative hidden sm:block" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  className={`p-2 transition-colors ${
                    isOverHero
                      ? accountOpen
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                      : `btn-ghost ${accountOpen ? "text-brand-green" : ""}`
                  }`}
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
                      <div className="p-1">
                        <Link
                          to="/profile"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-brand-green-soft dark:hover:bg-brand-black"
                        >
                          <FiUser /> Profile details
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-brand-green-soft dark:hover:bg-brand-black"
                        >
                          <FiShoppingBag /> My orders
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-green hover:bg-brand-green-soft dark:hover:bg-brand-black"
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
                        >
                          <FiLogOut /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`relative p-2 transition-colors ${
                isOverHero ? "text-white/80 hover:text-white" : "btn-ghost"
              }`}
              aria-label="Wishlist"
            >
              <FiHeart />
              {wishlist?.products?.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-[10px] font-bold text-white">
                  {wishlist.products.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative p-2 transition-colors ${
                isOverHero ? "text-white/80 hover:text-white" : "btn-ghost"
              }`}
              aria-label="Cart"
            >
              <FiShoppingBag />
              {totals.count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-[10px] font-bold text-white">
                  {totals.count}
                </span>
              )}
            </Link>

            {/* Login / Register */}
            {!isAuthenticated && (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className={`px-3 py-2 text-sm font-semibold transition-colors ${
                    isOverHero ? "text-white/80 hover:text-white" : "btn-ghost"
                  }`}
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-3 py-2 text-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className={`p-2 transition-colors lg:hidden ${
                isOverHero ? "text-white/80 hover:text-white" : "btn-ghost"
              }`}
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/10 bg-brand-black/95 backdrop-blur-md lg:hidden"
            >
              <div className="container-app space-y-1 py-4">
                <div className="relative mb-3">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={handleSearchChange}
                    className="input pl-10"
                  />
                </div>
                {links.map((l) => (
                  <NavLink
                    key={l.name}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-2.5 text-sm font-medium text-white transition ${
                        isActive
                          ? "bg-brand-green/20 text-brand-green"
                          : "hover:bg-white/5"
                      }`
                    }
                  >
                    {l.name}
                  </NavLink>
                ))}
                {!isAuthenticated && (
                  <div className="flex gap-2 pt-2">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="btn-outline flex-1 text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="btn-primary flex-1 text-sm"
                    >
                      Register
                    </Link>
                  </div>
                )}
                {isAuthenticated && (
                  <div className="border-t border-white/10 pt-3">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white hover:bg-white/5"
                    >
                      <FiUser /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white hover:bg-white/5"
                    >
                      <FiShoppingBag /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-brand-green hover:bg-white/5"
                      >
                        <FiGrid /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/5"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
