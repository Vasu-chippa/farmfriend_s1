
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import authUtils from "../../utils/auth";

const RequireAuth = ({ allowedRoles, redirectTo = "/login", children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const restoreAuth = async () => {
      try {
        const cached = authUtils.getUser();
        if (cached) {
          if (mounted) {
            setUser(cached);
            setLoading(false);
          }
          return;
        }

        // Verify persisted cookie or bearer-token sessions with the server.
        const freshUser = await authUtils.fetchCurrentUser();
        if (mounted) {
          setUser(freshUser);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    restoreAuth();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1f2937" }}>Loading your workspace…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAuth;