// src/pages/Buyer/Marketplace.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";
import { motion } from 'framer-motion';
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

  if (loading) return <LoadingSkeleton count={6} />;

  return (
    <div className="mp-layout">
      <div className="mp-header">
        <h2>🌾 Marketplace</h2>
      </div>

      {products.length === 0 ? (
        <div className="mp-empty">No products available. Farmers haven't uploaded anything yet.</div>
      ) : (
        <div className="market-grid">
          {products.map((p) => (
            <motion.div key={p._id} whileHover={{ scale: 1.02 }} initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{duration:0.28}}>
              <Card className="mp-card">
                <div className="mp-card-image" onClick={() => navigate(`/buyer/marketplace/${p._id}`)}>
                  {p.images && p.images.length ? (
                    <img src={p.images[0].startsWith('http') ? p.images[0] : `${process.env.REACT_APP_API_URL?.replace(/\/api\/?$/i, "") || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${p.images[0]}`} alt={p.name} onError={(e)=>{e.target.onerror=null; e.target.src=`${process.env.PUBLIC_URL}/cropimages/default.jpeg`}} />
                  ) : (
                    <img src={`${process.env.PUBLIC_URL}/cropimages/default.jpeg`} alt={p.name} />
                  )}
                </div>

                <div className="mp-card-body">
                  <h3 className="mp-card-title">{p.name}</h3>
                  <div className="mp-meta">
                    <div><strong>Price:</strong> ₹{p.price}/kg</div>
                    <div><strong>Qty:</strong> {p.quantity} kg</div>
                  </div>

                  <div className="mp-actions">
                    <Button onClick={() => navigate(`/buyer/marketplace/${p._id}`)}>View & Buy</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;