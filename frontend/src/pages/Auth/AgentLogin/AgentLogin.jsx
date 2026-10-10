// apps/frontend/src/pages/Auth/AgentLogin/AgentLogin.jsx
import React, { useState } from "react";

import API from "../../../api";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { setAuth } from "../../../utils/auth";
import wave from "../wave.png";
import bg from "../bg.svg";
import avatar from "../avatar.svg";
import "../Auth.css";


function AgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // call backend route (API uses baseURL from .env)
      const res = await API.post("/agents/login", { email, password });

      // Expect backend response: { message, user, token } or { token, user }
      const { token, user } = res.data;

      if (!res.data || !token) {
        return toast.error("Login failed: invalid response from server");
      }

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuth(user);

      toast.success("Login successful!");
      setTimeout(() => navigate("/agent/dashboard"), 1000);
    } catch (err) {
      console.error("Agent Login Error:", err.response?.data || err.message);
      toast.error("Login failed: " + (err.response?.data?.message || err.message));
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
            <h2 className="title">Agent Login</h2>
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
export default AgentLogin;