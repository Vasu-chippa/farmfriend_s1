// apps/frontend/src/pages/Auth/AdminLogin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../../api";
import { setAuth } from "../../../utils/auth";
import "../../Auth/Auth.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      if (data.user.role !== "admin") {
        alert("Access denied: Only Admins allowed ❌");
        return;
      }

      // Save token + user to localStorage
      setAuth(data.token, data.user);

      alert("✅ Admin login successful");
      navigate("/admin/dashboard"); // redirect to admin dashboard

    } catch (error) {
      console.error(error);
      alert("❌ Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
