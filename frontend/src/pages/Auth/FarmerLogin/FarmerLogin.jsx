import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../api";
import { FaEnvelope, FaLock } from "react-icons/fa";
import wave from "../wave.png";
import bg from "../bg.svg";
import avatar from "../avatar.svg";
import "../Auth.css";

function FarmerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      // Prefer server-provided user, but verify session by fetching /auth/me
      let user = res.data?.user;
      try {
        const me = await API.get("/auth/me");
        if (me?.data?.user) user = me.data.user;
      } catch (e) {
        // If /auth/me fails, fall back to response user if present
      }

      if (!user) {
        toast.error("Login did not return a valid user session");
        return;
      }

      // populate client cache for compatibility helpers
      try { await import("../../../utils/auth").then(mod => mod.setAuth(user)); } catch (e) {}
      toast.success(`Welcome back, ${user.fullName}!`);
      setTimeout(() => {
        if (user.role === "farmer") navigate("/farmer/dashboard");
        else if (user.role === "buyer") navigate("/buyer/dashboard");
        else if (user.role === "agent") navigate("/agent/dashboard");
        else if (user.role === "admin") navigate("/admin/dashboard");
        else navigate("/");
      }, 1000);
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      toast.error("Login failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="auth-page">
      <img src={wave} alt="wave" className="wave" />
      <div className="auth-container">
        <div className="auth-image">
          <img src={bg} alt="background" />
        </div>

        <div className="auth-content">
          <form onSubmit={handleSubmit}>
            <img src={avatar} alt="avatar" className="avatar" />
            <h2 className="title">Farmer Login</h2>

            <div className="floating-label-group">
              <FaEnvelope className="icon" />
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label>Email</label>
            </div>

            <div className="floating-label-group">
              <FaLock className="icon" />
              <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <label>Password</label>
            </div>

            {/* <a href="#">Forgot Password?</a> */}
            <button type="submit" className="btn">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FarmerLogin;
