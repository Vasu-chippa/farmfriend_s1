/* apps/frontend/src/pages/Farmer/SelectCrop/CropDetails.jsx */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../../api";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./CropDetails.css";

const CropDetails = () => {
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // extract crop id from URL
  const queryParams = new URLSearchParams(location.search);
  const cropId = queryParams.get("id");

  // fetch crop details (no warning version ✅)
  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const res = await API.get(`/crops/${cropId}`);
        setCrop(res.data);
      } catch (err) {
        console.error(err);
        alert("❌ Error fetching crop details");
      } finally {
        setLoading(false);
      }
    };

    if (cropId) {
      fetchCropDetails();
    }
  }, [cropId]);

  // add crop to my list
  const handleAddToMyCrops = async () => {
    try {
      await API.post("/mycrops/add", { cropId });
      alert("✅ Crop added to your list!");
      navigate("/farmer/crops");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add crop");
    }
  };

  if (loading) return <p>Loading crop details...</p>;
  if (!crop) return <p>No crop found.</p>;

  return (
    <div className="crop-details">
      <div className="crop-header">
        <img src={crop.image || "/default-crop.jpg"} alt={crop.name} />
        <div className="crop-info">
          <h2>{crop.name}</h2>
          <p>{crop.description || "No description available"}</p>
          <p><b>Duration:</b> {crop.duration || "N/A"} days</p>
          <p><b>Season:</b> {crop.season || "All"}</p>
          <p><b>Expected Expense:</b> ₹{crop.expectedExpense || 0}</p>
          <p><b>Expected Profit:</b> ₹{crop.expectedProfit || 0}</p>
        </div>
      </div>

      {/* Price Trend Graph */}
      <div className="price-chart">
        <h3>📈 Price Trend (₹/kg)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={crop.priceTrend || []}>
            <Line type="monotone" dataKey="price" stroke="#2d6a4f" strokeWidth={2} />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Action buttons */}
      <div className="actions">
        <button className="btn-primary" onClick={handleAddToMyCrops}>
          ➕ Add to My Crops
        </button>
        <button className="btn-secondary" onClick={() => navigate("/farmer/crops")}>
          🔙 Back to My Crops
        </button>
      </div>
    </div>
  );
};

export default CropDetails;
