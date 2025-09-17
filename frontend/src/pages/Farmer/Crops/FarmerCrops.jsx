// apps/frontend/src/pages/Farmer/Crops/FarmerCrops.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./FarmerCrops.css";

const FarmerCrops = () => {
  const [crops, setCrops] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch all crops
  const fetchCrops = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/crops", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCrops(res.data);
    } catch (err) {
      console.error("❌ Error fetching crops:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  return (
    <div className="farmer-crops">
      <h2>🌱 Farmer's Crop List</h2>
      <div className="crop-list">
        {crops.map((crop) => (
          <motion.div
            key={crop._id}
            className="crop-card"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            onClick={() => navigate(`/farmer/cropdetailsview/${crop._id}`)}
          >
           <img
  src={`${process.env.PUBLIC_URL}/cropimages/${crop.name.toLowerCase()}.jpeg`}
  alt={crop.name}
  onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/cropimages/default.jpeg`)}
/>


            <h3>{crop.name}</h3>
            <p className="crop-category">🌿 {crop.category || "General"}</p>
            <p className="crop-quality">✅ {crop.quality || "Organic"}</p>
            <p className="crop-availability">
              {crop.quantity > 0 ? "Available" : "Out of Stock"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FarmerCrops;
