// src/components/RequireAuth.jsx
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user")) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
