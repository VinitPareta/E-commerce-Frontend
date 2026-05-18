import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin"; // Admin login page
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import NotFound from "./pages/NotFound";

import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminProductForm from "./admin/AdminProductForm";
import AdminOrders from "./admin/AdminOrders";
import AdminUsers from "./admin/AdminUsers";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} /> // Admin login
          route
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
