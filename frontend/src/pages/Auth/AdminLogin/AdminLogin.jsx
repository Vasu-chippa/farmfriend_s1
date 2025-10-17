// frontend/src/pages/Auth/AdminLogin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api";
import { setAuth } from "../../../utils/auth";
import { FaEnvelope, FaLock } from "react-icons/fa";
import wave from "../wave.png";
import bg from "../bg.svg";
import avatar from "../avatar.svg";
import "../Auth.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/login", { email, password });

      if (data.user.role !== "admin") {
        alert("Access denied ❌ (Admins only)");
        return;
      }

      // Save token + user
      await setAuth(data.token, data.user);

      alert("✅ Admin login successful");

      // Ensure navigation happens after saving
      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 200);

    } catch (error) {
      console.error(error);
      alert("❌ Login failed: " + (error.response?.data?.message || "Server error"));
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
            <h2 className="title">Admin Login</h2>

            <div className="floating-label-group">
              <FaEnvelope className="icon" />
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
              <label>Password</label>
            </div>

            <button type="submit" className="btn">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
