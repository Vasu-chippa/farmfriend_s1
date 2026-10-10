import React, { useState } from "react";
import { register } from "../../../services/authService";
import { FaUser, FaEnvelope, FaLock, FaLeaf } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import wave from "../wave.png";
import bg from "../bg.svg";
import avatar from "../avatar.svg";
import "../Auth.css";

function FarmerRegister() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [landSize, setLandSize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const { user } = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        landSize,
        role: "farmer",
      });
      toast.success(`✅ Farmer registered successfully: ${user.fullName}`);
      setTimeout(() => navigate("/farmer/login"), 1000);
    } catch (err) {
      const responseData = err.response?.data;
      const validationMessage = responseData?.errors
        ?.map((error) => error.msg)
        .filter(Boolean)
        .join(" ");
      const message = responseData?.message || validationMessage || err.message || "Please try again.";
      console.error("Registration failed:", message);
      toast.error(`Registration failed: ${message}`);
    } finally {
      setSubmitting(false);
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
            <h2 className="title">Farmer Registration</h2>

            <div className="floating-label-group">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder=" "
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                minLength={3}
                required
                autoComplete="name"
              />
              <label>Full Name</label>
            </div>

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
                minLength={6}
                required
                autoComplete="new-password"
              />
              <label>Password</label>
            </div>

            {/* Land Size uses existing input styling for distinction */}
            <div className="input-box">
              <label><FaLeaf className="icon" /> Land Size (in acres)</label>
              <input
                type="number"
                placeholder="Enter land size"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                min="0"
                step="any"
                required
              />
            </div>

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FarmerRegister;
