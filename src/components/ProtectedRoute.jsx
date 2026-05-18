import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to={adminOnly ? "/admin/login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
