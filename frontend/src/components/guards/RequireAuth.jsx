
// this is for agent, buyer, farmer login authentication and authorization. not working for admin.
// src/components/guard/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";

const RequireAuth = ({ allowedRoles, redirectTo = "/login", children }) => {
  const location = useLocation();
  const user = getCurrentUser(); // ✅ always read from localStorage

  if (!user) {
    // No user → force login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role → block
    return <Navigate to="/" replace />;
  }

  // ✅ Allowed → render children
  return children;
};

export default RequireAuth;