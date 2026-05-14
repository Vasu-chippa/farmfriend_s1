// frontend/src/pages/buyer/MyOrders.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import OrderTimeline from "../../../components/Order/OrderTimeline";
import { FiHash, FiCreditCard, FiPackage } from 'react-icons/fi';
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/buyers/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // No edit/delete actions per design — show order identifiers instead

  if (loading) return <p className="orders-loading">Loading your orders...</p>;

  return (
    <div className="orders-layout">
      <div className="orders-container">
        <h2 className="orders-title">📦 My Orders</h2>
        {orders.length === 0 ? (
          <p className="no-orders">No orders found.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th></th>
                <th>Product</th>
                <th>Quantity (kg)</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                  <tr key={order._id} className="order-row">
                  <td>
                    {/* <img
  src={
    order.product?.images?.length > 0
      ? `http://localhost:5000${order.product.images[0]}`
      : "https://via.placeholder.com/80x60?text=No+Image"
  }
  alt={order.product?.name}
  className="order-img"
/> */}

                  </td>
                  <td className="col-product"><div className="prod-cell"><FiPackage className="prod-icon"/>{order.product?.name}</div></td>
                  <td className="col-qty">{order.quantity}</td>
                  <td className="col-total">₹{order.total}</td>
                  <td className="col-status">
                    <OrderTimeline status={order.status} />
                  </td>
                  <td className="col-date">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="col-ids">
                    <div className="id-row"><FiHash className="id-icon"/> <span className="id-val">{order._id}</span></div>
                    <div className="id-row"><FiCreditCard className="id-icon"/> <span className="id-val">{order.payment?.transactionId || '—'}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
