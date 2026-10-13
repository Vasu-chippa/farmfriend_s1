// src/pages/Buyer/CropPurchase.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../api";
import "./CropPurchase.css";

function CropPurchase() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const navigate = useNavigate();
  const availableQuantity = Number(product?.quantity || 0);
  const isQuantityValid = Number.isFinite(quantity) && quantity > 0 && quantity <= availableQuantity;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/marketplace/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("❌ Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  const placeOrder = async (paymentMethod) => {
    if (!isQuantityValid) {
      setOrderError(`Enter a quantity greater than 0 and no more than ${availableQuantity} kg.`);
      return;
    }

    setOrderError("");
    setProcessing(true);

    try {
      const token = localStorage.getItem("token");

      const res = await API.post(
        "/buyers/orders",
        { productId: product._id, quantity, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = res.data;

      navigate(`/buyer/orders/confirmation/${order._id}`, {
        state: { order },
      });

    } catch (err) {
      setOrderError(err.response?.data?.error || "Could not place the order. Please try again.");

    } finally {
      setProcessing(false);
    }
  };

  if (!product) return <p className="loading">Loading crop details...</p>;

  return (
    <div className="purchase-layout">
      <div className="purchase-container">

        <div className="purchase-card">

          {/* LEFT SIDE - DETAILS */}
          <div className="details-section">
            <h2 className="crop-title">{product.name}</h2>

            <p className="crop-desc">
              {product.description || "No description available"}
            </p>

            <div className="crop-info">
              <span>Price</span>
              <span>₹{product.price} / kg</span>
            </div>

            <div className="crop-info">
              <span>Available Quantity</span>
              <span>{product.quantity} kg</span>
            </div>

            <div className="crop-info">
              <span>Quality</span>
              <span>{product.quality || "N/A"}</span>
            </div>

            <div className="crop-info">
              <span>Organic</span>
              <span>{product.isOrganic ? "✅ Yes" : "❌ No"}</span>
            </div>
          </div>

          {/* RIGHT SIDE - ORDER BOX */}
          <div className="order-box">
            <h3>Place Order</h3>

            <label>Enter Quantity (kg)</label>
            <input
              type="number"
              value={Number.isFinite(quantity) ? quantity : ""}
              min="0.01"
              max={availableQuantity}
              step="any"
              onChange={(e) => setQuantity(e.target.value === "" ? "" : e.target.valueAsNumber)}
            />
            {quantity !== "" && !isQuantityValid && (
              <p className="order-error" role="alert">
                Enter a quantity greater than 0 and no more than {availableQuantity} kg.
              </p>
            )}
            {orderError && <p className="order-error" role="alert">{orderError}</p>}

            <label>Payment Method</label>
            <select id="paymentMethod">
              <option>Credit Card</option>
              <option>UPI</option>
              <option>PayPal</option>
              <option>Bank Transfer</option>
            </select>

            <button
              className="order-btn"
              disabled={processing || !isQuantityValid}
              onClick={() => {
                const method =
                  document.getElementById("paymentMethod").value;
                placeOrder(method);
              }}
            >
              {processing ? "Processing..." : "Place Order"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CropPurchase;