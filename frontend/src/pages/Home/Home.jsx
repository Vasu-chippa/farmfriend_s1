// File: apps/frontend/src/pages/Home/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Home.css";
import Footer from "../../components/Footer";

// Assuming these utility functions are correctly implemented
import { isAuthenticated, getRole } from "../../utils/auth"; 

const Home = () => {
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const role = getRole();

  const handleGetStarted = () => {
    if (!authed) {
      navigate("/farmer/login");
    } else {
      // Role-based routing
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "farmer") navigate("/farmer/dashboard");
      else if (role === "buyer") navigate("/buyer/dashboard");
      else if (role === "agent") navigate("/agent/dashboard");
      else navigate("/");
    }
  };

  // --- FRAMER MOTION VARIANTS ---

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            type: "spring", 
            stiffness: 70, 
            duration: 0.8 
        } 
    },
  };

  const featureContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const roleCardVariants = {
    hidden: { opacity: 0, x: -20, rotateY: 90 },
    visible: { 
        opacity: 1, 
        x: 0, 
        rotateY: 0,
        transition: { 
            type: "spring", 
            stiffness: 100, 
            damping: 15 
        } 
    },
    hover: { 
        scale: 1.05, 
        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.25)",
    },
  };
  
  const aboutVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { duration: 0.8 } 
    }
  };

  return (
    <div className="ff-home-page">
      {/* --------------------- 1. HERO SECTION --------------------- */}
      <motion.header 
        className="hero"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <div className="hero-inner container">
          <div className="hero-content">
            <h1 className="hero-title">FarmFriend: <span className="highlight">Direct Farm-to-Market</span></h1>
            <p className="hero-sub">
              Digitizing agriculture trade with **transparency, efficiency, and fair pricing**. Manage crops, connect with buyers, and streamline logistics—all in one place.
            </p>

            <div className="hero-cta">
              <motion.button 
                className="btn-primary" 
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {authed ? "Go to Dashboard" : "Get Started Now"}
              </motion.button>
              <motion.button
                className="btn-ghost"
                onClick={() => navigate("/marketplace")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Marketplace
              </motion.button>
            </div>
          </div>

          {/* FIX: Simplified Visual - Only the Logo as the centerpiece */}
          <motion.div 
            className="hero-visual-container" 
            aria-hidden
            initial={{ opacity: 0, x: 50, rotate: 0 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="hero-visual-device">
                
                {/* 1. Large Circular Logo Element (The sole centerpiece) */}
                <div className="logo-center-circle">
                    {/* FIX: Logo using PUBLIC_URL in JSX */}
                    <img 
                      src={'/logo.png'} 
                      alt="FarmFriend Logo" 
                      className="logo-img-center" 
                    />
                </div>
                
                {/* REMOVED: Floating Animated App Mockup */}
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* --------------------- 2. ROLE BENEFITS SECTION (No changes) --------------------- */}
      <motion.section 
        className="role-benefits"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={featureContainerVariants}
      >
        <div className="container">
            <h2>Empowering Every Role in the Supply Chain</h2>
            <div className="role-grid">
                
                <motion.article className="role-card farmer-card" variants={roleCardVariants} whileHover="hover">
                    <div className="role-icon">👨‍🌾</div>
                    <h3>For the Farmer</h3>
                    <ul>
                        <li><span className="dot"></span> **Control:** List crops with full detail and set your own price.</li>
                        <li><span className="dot"></span> **Efficiency:** Digital crop & harvest management (CRUD).</li>
                        <li><span className="dot"></span> **Demand:** View real-time buyer interest and market demand.</li>
                    </ul>
                </motion.article>

                <motion.article className="role-card buyer-card" variants={roleCardVariants} whileHover="hover">
                    <div className="role-icon">🛍️</div>
                    <h3>For the Buyer</h3>
                    <ul>
                        <li><span className="dot"></span> **Quality:** Direct access to fresh, local, and organic produce.</li>
                        <li><span className="dot"></span> **Trust:** Rate farmers and track your orders end-to-end.</li>
                        <li><span className="dot"></span> **Choice:** Advanced filtering (price, quality, farmer) in the marketplace.</li>
                    </ul>
                </motion.article>
                
                <motion.article className="role-card agent-card" variants={roleCardVariants} whileHover="hover">
                    <div className="role-icon">🚚</div>
                    <h3>For the Agent</h3>
                    <ul>
                        <li><span className="dot"></span> **Streamlining:** Simplified order assignment and status updates.</li>
                        <li><span className="dot"></span> **Logistics:** Tools for easy pickup, delivery, and transport management.</li>
                        <li><span className="dot"></span> **Support:** Central hub for dispute resolution and farmer onboarding.</li>
                    </ul>
                </motion.article>
            </div>
        </div>
      </motion.section>

      {/* --------------------- 3. ABOUT/CORE VALUES SECTION (No changes) --------------------- */}
      <motion.section 
        className="about-project"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={aboutVariants}
      >
        <div className="container">
          <h2>Our Promise: Transparency and Efficiency</h2>
          <div className="about-content">
            <p>
              FarmFriend is built to solve the complex inefficiencies of traditional agricultural trade. Our platform brings **every step into the light**, from the farmer's listing details to the agent's delivery status. This commitment ensures fair prices for farmers and assured quality for buyers.
            </p>
            <div className="core-values">
                <div className="value-item">
                    <div className="value-icon">👁️‍🗨️</div>
                    <h3>Full Transparency</h3>
                    <p>Buyer reviews, crop verification tools, and clear pricing structure eliminates hidden fees and distrust.</p>
                </div>
                <div className="value-item">
                    <div className="value-icon">⚡</div>
                    <h3>Maximum Efficiency</h3>
                    <p>Role-based dashboards, JWT security, and MERN stack speed streamline management and transactions.</p>
                </div>
                <div className="value-item">
                    <div className="value-icon">📈</div>
                    <h3>Sustainable Growth</h3>
                    <p>Focus on data-driven decisions and direct market access for long-term prosperity.</p>
                </div>
            </div>
          </div>
        </div>
      </motion.section>


      {/* --------------------- 4. FEATURES SECTION (No changes) --------------------- */}
      <section className="features">
        <div className="container">
          <h2>Core Modules to Power Your Operations</h2>
          <motion.div 
             className="feature-grid"
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, amount: 0.3 }}
             variants={featureContainerVariants}
          >
            <motion.article className="feature-card animated-module-card" variants={aboutVariants} whileHover={{ scale: 1.05 }}>
              <div className="feature-icon">🌾</div>
              <h3>Crop Management</h3>
              <p>Select crops for your land, track growth cycles, and get recommendations by season & soil type.</p>
            </motion.article>

            <motion.article className="feature-card animated-module-card" variants={aboutVariants} whileHover={{ scale: 1.05 }}>
              <div className="feature-icon">📊</div>
              <h3>Profit Analysis</h3>
              <p>Track all costs and sales to view profit/loss per crop, compare seasons, and improve decisions.</p>
            </motion.article>

            <motion.article className="feature-card animated-module-card" variants={aboutVariants} whileHover={{ scale: 1.05 }}>
              <div className="feature-icon">🛒</div>
              <h3>Digital Marketplace</h3>
              <p>List produce with images & pricing, reach local buyers, and accept orders securely.</p>
            </motion.article>

            <motion.article className="feature-card animated-module-card" variants={aboutVariants} whileHover={{ scale: 1.05 }}>
              <div className="feature-icon">💬</div>
              <h3>Secure Chat</h3>
              <p>Direct communication between Farmers and Buyers/Agents for smooth inquiries and logistics.</p>
            </motion.article>
          </motion.div>
        </div>
      </section>


      {/* --------------------- 5. QUICK START/CTA SECTION (No changes) --------------------- */}
      <section className="quick-start">
        <div className="container">
          <h2>Ready to revolutionize your agricultural trade?</h2>
          <p>
            Join FarmFriend today to start managing crops, tracking expenses, and connecting directly to the market.
          </p>
          <motion.div 
            className="hero-cta"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button 
              className="btn-primary" 
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(27,67,50,0.25)" }}
              whileTap={{ scale: 0.95 }}
            >
              {authed ? "Go to Dashboard" : "Create Your Free Account"}
            </motion.button>
            <motion.button
              className="btn-ghost"
              onClick={() => navigate(authed ? "/farmer/profile" : "/farmer/register")}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.8)" }}
              whileTap={{ scale: 0.95 }}
            >
              {authed ? "View Profile" : "Register as Farmer"}
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;