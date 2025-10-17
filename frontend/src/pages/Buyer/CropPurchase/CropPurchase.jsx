// src/pages/Buyer/CropPurchase.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
//import axios from "axios";
import API from "../../../api";
import BuyerSidebar from "../../../components/BuyerSidebar";
import "./CropPurchase.css";

function CropPurchase() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // ✅ Use same route style as Marketplace
        const res = await API.get(`/marketplace/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("❌ Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  // 💡 UPDATED: Now accepts paymentMethod as an argument and sends it to the API
  const placeOrder = async (paymentMethod) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/buyers/orders",
        // Send paymentMethod in the request body
        { productId: product._id, quantity, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Redirect after success
      navigate("/buyer/orders");
    } catch (err) {
      alert("❌ Failed to place order");
      console.error(err);
    }
  };

  if (!product) return <p className="loading">Loading crop details...</p>;

  return (
    <div className="purchase-layout">
      <BuyerSidebar />
      <div className="purchase-container">
        <div className="purchase-card">
          {/* <div className="image-section">
            <img
              src={
                product.images?.length > 0
                  ? `http://localhost:5000${product.images[0]}`
                  : `${process.env.PUBLIC_URL}/cropimages/default.jpeg`
              }
              alt={product.name}
              className="crop-image"
            />
          </div> */}

          <div className="details-section">
            <h2 className="crop-title">{product.name}</h2>
            <p className="crop-desc">{product.description || "No description available"}</p>
            <p className="crop-info">
              <strong>Price:</strong> ₹{product.price} /kg
            </p>
            <p className="crop-info">
              <strong>Available Quantity:</strong> {product.quantity} kg
            </p>
            <p className="crop-info">
              <strong>Quality:</strong> {product.quality || "N/A"}
            </p>
            <p className="crop-info">
              <strong>Organic:</strong> {product.isOrganic ? "✅ Yes" : "❌ No"}
            </p>

            {/* 💡 UPDATED order-section with payment method selection and updated onClick */}
            <div className="order-section">
              <label htmlFor="quantityInput">Enter Quantity (kg):</label>
              <input
                id="quantityInput"
                type="number"
                value={quantity}
                min="1"
                max={product.quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />

              <label htmlFor="paymentMethod">Payment Method:</label>
              <select id="paymentMethod" defaultValue="Credit Card">
                <option>Credit Card</option>
                <option>UPI</option>
                <option>PayPal</option>
                <option>Bank Transfer</option>
                <option>Other</option>
              </select>

              <button
                onClick={() => {
                  // Get the selected payment method and call placeOrder with it
                  const method = document.getElementById("paymentMethod").value;
                  placeOrder(method);
                }}
                className="order-btn"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropPurchase;