/* apps/frontend/src/components/Navbar.jsx */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { isAuthenticated, getRole, getUser, clearAuth, fetchCurrentUser } from "../utils/auth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(isAuthenticated());
  const [role, setRole] = useState(getRole());
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchCurrentUser().then((user) => {
      if (mounted) {
        setAuthed(Boolean(user));
        setRole(user?.role || null);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    setAuthed(false);
    setRole(null);
    navigate("/");
  };

  const user = getUser();

  return (
    <nav className="ff-nav">
      {/* Brand */}
      <div className="ff-brand">
        <Link to="/">FarmFriend</Link>
      </div>

      {/* Left Links */}
      <ul className="ff-links">
        <li><Link to="/">Home</Link></li>
      </ul>

      {/* Right Section */}
      <div className="ff-right" ref={dropdownRef}>
        {!authed ? (
          // Login dropdown
          <div className="ff-dropdown">
            <button className="ff-btn" onClick={() => setOpen(!open)}>
              Login ▾
            </button>
            {open && (
              <ul className="ff-menu">
                <li><Link to="/farmer/login">Farmer Login</Link></li>
                <li><Link to="/farmer/register">Farmer Register</Link></li>
                <li className="separator" />
                <li><Link to="/buyer/login">Buyer Login</Link></li>
                <li><Link to="/buyer/register">Buyer Register</Link></li>
                <li className="separator" />
                <li><Link to="/agent/login">Agent Login</Link></li>
                <li className="separator" />
                <li><Link to="/admin/login">Admin Login</Link></li>
              </ul>
            )}
          </div>
        ) : (
          <>
            {/* Show role dashboard link */}
            {/* {role === "admin" && (
              <Link to="/admin/dashboard" className="ff-link">Dashboard</Link>
            )} */}
            {role === "farmer" && (
              <Link to="/farmer/dashboard" className="ff-link">Dashboard</Link>
            )}
            {role === "buyer" && (
              <Link to="/buyer/dashboard" className="ff-link">Dashboard</Link>
            )}
            {role === "agent" && (
              <Link to="/agent/dashboard" className="ff-link">Dashboard</Link>
            )}

            {/* User info + logout */}
            <span className="ff-user">
              {user?.fullName || role?.toUpperCase()}
            </span>
            <button className="ff-btn danger" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
