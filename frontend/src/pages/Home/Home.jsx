// File: apps/frontend/src/pages/Home/Home.jsx

import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import "./Home.css";

import Footer from "../../components/Footer";
import { isAuthenticated, getRole } from "../../utils/auth";

// --- PLATFORM IMPACT METRICS ---
const PLATFORM_STATS = [
  { label: "Verified Farmers", value: "12,500+" },
  { label: "Active Buyers", value: "4,800+" },
  { label: "Crops Traded", value: "85,000 MT" },
  { label: "Fair Trade Value", value: "$14.2M" },
];

// --- ADVANCED GLASS 3D TILT CARD COMPONENT ---
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ transform: "translateZ(25px)", height: "100%" }}>{children}</div>
    </motion.div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const role = getRole();
  const containerRef = useRef(null);

  const handleGetStarted = () => {
    if (!authed) {
      navigate("/farmer/login");
    } else {
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "farmer") navigate("/farmer/dashboard");
      else if (role === "buyer") navigate("/buyer/dashboard");
      else if (role === "agent") navigate("/agent/dashboard");
      else navigate("/");
    }
  };

  return (
    <div className="ff-home-page" ref={containerRef}>
      {/* --------------------- 1. HERO SECTION --------------------- */}
      <header className="hero">
        {/* Floating Background Particles */}
        <div className="hero-particles" aria-hidden="true">
          {[
            { icon: "🍃", top: "12%", left: "6%", duration: 7, delay: 0 },
            { icon: "🌾", top: "65%", left: "88%", duration: 9, delay: 1.5 },
            { icon: "🌱", top: "80%", left: "10%", duration: 6, delay: 0.8 },
            { icon: "🌿", top: "22%", left: "82%", duration: 8, delay: 2 },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="particle-item"
              style={{ top: item.top, left: item.left }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 20, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.delay,
              }}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>

        <div className="container hero-inner">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Top Left Badge with Brand Emblem */}
            <div className="hero-badge">
              <img src="/logo.png" alt="FarmFriend Logo" className="hero-badge-logo" />
              <span className="pulse-dot"></span> Next-Gen AgriTech Ecosystem
            </div>

            <h1 className="hero-title">
              FarmFriend: <br />
              <span className="highlight-gradient">Direct Farm-to-Market</span>
            </h1>

            <p className="hero-sub">
              Empower direct agricultural trade, access real-time pricing transparency, eliminate middlemen, and track crop logistics with precision intelligence.
            </p>

            <div className="hero-cta">
              <motion.button
                className="btn-primary-glow"
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {authed ? "Go to Dashboard" : "Get Started Free"}
              </motion.button>

              <motion.button
                className="btn-glass"
                onClick={() => navigate("/marketplace")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Marketplace
              </motion.button>
            </div>
          </motion.div>

          {/* Cinematic 3D Glowing Centerpiece */}
          <motion.div
            className="hero-visual-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <div className="hero-visual-device">
              <motion.div
                className="ambient-glow"
                animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Orbiting Ring */}
              <motion.svg
                className="orbit-svg"
                viewBox="0 0 320 320"
                animate={{ rotate: 360 }}
                transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              >
                <circle
                  cx="160"
                  cy="160"
                  r="145"
                  stroke="rgba(82, 183, 136, 0.35)"
                  strokeWidth="2.5"
                  strokeDasharray="12 14"
                  fill="none"
                />
              </motion.svg>

              <TiltCard className="logo-center-card">
                <img src="/logo.png" alt="FarmFriend Logo" className="logo-img-center" />
              </TiltCard>
            </div>
          </motion.div>
        </div>
      </header>

      {/* --------------------- 2. IMPACT STATS --------------------- */}
      <section className="stats-section">
        <div className="container stats-grid">
          {PLATFORM_STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              className="stat-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------- 3. STAKEHOLDER BENEFITS --------------------- */}
      <section className="role-benefits">
        <div className="container">
          <div className="section-header">
            <h2>Built for Every Stakeholder</h2>
            <p>Empowering seamless collaboration and trust across the agricultural supply chain.</p>
          </div>

          <div className="role-grid">
            <TiltCard className="role-card">
              <div className="role-icon">👨‍🌾</div>
              <h3>For Farmers</h3>
              <ul>
                <li><strong>Price Freedom:</strong> Set crops and pricing directly without brokers.</li>
                <li><strong>Digital CRUD:</strong> Track harvests, inventory, and growth cycles.</li>
                <li><strong>Live Demand:</strong> Analyze buyer trends and market requirements.</li>
              </ul>
            </TiltCard>

            <TiltCard className="role-card">
              <div className="role-icon">🛍️</div>
              <h3>For Buyers</h3>
              <ul>
                <li><strong>Verified Quality:</strong> Direct access to local organic produce.</li>
                <li><strong>End-to-End Tracking:</strong> Monitor orders from farm to warehouse.</li>
                <li><strong>Smart Filtering:</strong> Advanced search by region, rating, and price.</li>
              </ul>
            </TiltCard>

            <TiltCard className="role-card">
              <div className="role-icon">🚚</div>
              <h3>For Logistics Agents</h3>
              <ul>
                <li><strong>Smart Dispatch:</strong> Streamlined delivery routes and assignment.</li>
                <li><strong>Status Sync:</strong> Live pickup notifications and milestone logs.</li>
                <li><strong>Support Hub:</strong> Rapid dispute resolution and onboarding tools.</li>
              </ul>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* --------------------- 4. CORE FEATURES --------------------- */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Complete Ecosystem Modules</h2>
            <p>Advanced digital architecture built to run modern agricultural operations smoothly.</p>
          </div>

          <div className="feature-grid">
            {[
              { icon: "🌾", title: "Crop Management", desc: "Select optimal crops per soil type, track lifecycles, and get seasonal insights." },
              { icon: "📊", title: "Profit Analytics", desc: "Monitor income vs expenses to review profit/loss metrics per harvest." },
              { icon: "🛒", title: "Digital Marketplace", desc: "Publish media-rich listings, connect with verified buyers, and sell securely." },
              { icon: "💬", title: "Secure Chat", desc: "Communicate directly between farmers, buyers, and delivery partners." },
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <div className="feature-icon">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------- 5. CINEMATIC CTA --------------------- */}
      <section className="quick-start">
        <div className="container">
          <motion.div
            className="cta-glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2>Ready to Transform Your Agricultural Trade?</h2>
            <p>Join the FarmFriend network today to streamline crop management and unlock direct market access.</p>
            <div className="hero-cta">
              <motion.button
                className="btn-primary-glow"
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {authed ? "Go to Dashboard" : "Create Free Account"}
              </motion.button>
              <motion.button
                className="btn-glass"
                onClick={() => navigate(authed ? "/farmer/profile" : "/farmer/register")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {authed ? "View Profile" : "Register as Farmer"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;