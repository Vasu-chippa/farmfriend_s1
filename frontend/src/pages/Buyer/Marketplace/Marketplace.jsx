// src/pages/Buyer/Marketplace.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import { useNavigate } from "react-router-dom";
import "./Marketplace.css";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
  const res = await API.get("/marketplace");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching marketplace items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="mp-loading">Loading marketplace...</div>;

  return (
    <div className="mp-layout">
      <div className="mp-header">
        <h2>🌾 Marketplace</h2>
      </div>

      <div className="mp-grid">
        {products.length === 0 && (
          <div className="mp-empty">
            No products available. Farmers haven't uploaded anything yet.
          </div>
        )}

        {products.map((p) => {
          // const imgPath =
          //   p.images && p.images.length
          //     ? `http://localhost:5000${p.images[0]}`
          //     : `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;

          return (
            <div key={p._id} className="mp-card">
              <div
                className="mp-card-image"
                onClick={() => navigate(`/buyer/marketplace/${p._id}`)}
              >
                {/* <img
                  src={imgPath}
                  alt={p.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;
                  }}
                /> */}
              </div>

              <div className="mp-card-body">
                <h3 className="mp-card-title">{p.name}</h3>
                {/* <p className="mp-card-desc">{p.description || "No description"}</p> */}
                <div   onClick={() => navigate(`/buyer/marketplace/${p._id}`)}
                      className="mp-meta">
                  <div><strong>Price:</strong> ₹{p.price}/kg</div>
                  <div><strong>Qty:</strong> {p.quantity} kg</div>
                  {/* <div><strong>Quality:</strong> {p.quality || "-"}</div> */}
                  {/* <div><strong>Organic:</strong> {p.isOrganic ? "✅ Yes" : "❌ No"}</div> */}
                  {/* <div className="mp-farmer"><strong>Farmer:</strong> {p.farmer?.name || "Unknown"}</div> */}
                </div>

                <div className="mp-actions">
                  <button
                    onClick={() => navigate(`/buyer/marketplace/${p._id}`)}
                    className="mp-btn view-btn"
                  >
                    View & Buy
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Marketplace;