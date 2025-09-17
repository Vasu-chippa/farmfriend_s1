// src/pages/HarvestList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./HarvestList.css";

const HarvestList = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHarvest = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/harvest", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = Array.isArray(res.data) ? res.data : res.data.crops || [];
        console.log("Harvest API response:", list); // 👈 Debugging
        setCrops(list);
      } catch (err) {
        console.error("Error fetching harvest list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHarvest();
  }, []);

  if (loading) return <p>Loading harvest list...</p>;
  if (!crops.length) return <p>No crops added to your harvest list yet.</p>;

  const getImageUrl = (img) => {
    if (!img) return `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;

    // If backend stored only filename like "tomato.jpeg"
    if (!img.startsWith("http")) {
      return `${process.env.PUBLIC_URL}/cropimages/${img}`;
    }

    // If backend gave full URL like http://localhost:5000/uploads/tomato.jpeg
    return img;
  };

  return (
    <div className="harvest-container">
      <h2>🌾 My Harvest List</h2>
      <div className="harvest-grid">
        {crops.map((crop) => {
          console.log("Crop image debug:", crop?.cropId?.image); // 👈 Check value

          return (
            <div
              key={crop.cropId._id}
              className="harvest-card"
              onClick={() => navigate(`/farmer/crop-records/${crop.cropId._id}`)}
            >
              <img
                src={getImageUrl(crop?.cropId?.image)}
                alt={crop?.cropId?.name || "crop"}
                className="harvest-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;
                }}
              />
              <div className="harvest-details">
                <h3>{crop.cropId.name}</h3>
                <p>
                  <b>Category:</b> {crop.cropId.category || "General"}
                </p>
                <p>
                  <b>Quality:</b> {crop.cropId.quality}
                </p>
                <p>
                  <b>Price:</b> ₹{crop.cropId.price}/kg
                </p>
                <p>
                  <b>Quantity:</b> {crop.cropId.quantity} kg
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HarvestList;
