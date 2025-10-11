import React from "react";
import { NavLink } from "react-router-dom";
import "./BuyerSidebar.css";
const links = [
  { to: "/buyer/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/buyer/marketplace", icon: "🛒", label: "Marketplace" },
  { to: "/buyer/orders", icon: "📦", label: "My Orders" },
  { to: "/buyer/profile", icon: "👤", label: "Profile" },
];
const BuyerSidebar = () => {
  return (
    <div className="sidebar-wrapper static-open">
      <aside className="buyer-sidebar">
        {/* Buyer Brand/Logo Section */}
        <div className="buyer-brand">FarmFriend —
          <br /> Buyer</div>

        <nav>
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  title={link.label}
                >
                  <span className="icon">{link.icon}</span>
                  <span className="text">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {/* Footer/User Info Section */}
        <div className="sidebar-footer">
          <small>
            Logged as: <strong>{/* Replace with actual buyer name if available */}Buyer User</strong>
          </small>
        </div>
      </aside>
      {/* Removed: Toggle button JSX completely */}
    </div>
  );
};
export default BuyerSidebar;