import React, { useState } from "react";
import API from "../../../api";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import wave from "../wave.png";
import bg from "../bg.svg";
import avatar from "../avatar.svg";
import "../Auth.css";

function BuyerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/buyers/login", { email, password });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      alert("✅ Login successful");
      navigate("/buyer/dashboard");
    } catch (err) {
      console.error("Buyer login error:", err);
      alert("❌ Login failed: " + (err.response?.data?.message || err.message));
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
                  <h2 className="title">Buyer Login</h2>

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

                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => alert("Password reset flow coming soon!")}
                  >
                    Forgot Password?
                  </button>

                  <button type="submit" className="btn">Login</button>
                </form>
              </div>
            </div>
          </div>
        );
      }

      export default BuyerLogin;
