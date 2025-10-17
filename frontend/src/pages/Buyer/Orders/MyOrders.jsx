// frontend/src/pages/buyer/MyOrders.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import BuyerSidebar from "../../../components/BuyerSidebar";
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

  // Delete Order
  const handleDelete = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
     await API.delete(`/buyers/orders/${orderId}`, {
       headers: { Authorization: `Bearer ${token}` },
     });

      setOrders(orders.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error("❌ Error deleting order:", err);
    }
  };

  // Update Order Quantity
  const handleUpdate = async (orderId) => {
    const newQty = prompt("Enter new quantity (kg):");
    if (!newQty || isNaN(newQty) || Number(newQty) <= 0) return;

    try {
      const token = localStorage.getItem("token");
    const res = await API.put(
      `/buyers/orders/${orderId}`,
       { quantity: Number(newQty) },
       { headers: { Authorization: `Bearer ${token}` } }
    );


      setOrders(
        orders.map((o) => (o._id === orderId ? { ...o, ...res.data } : o))
      );
    } catch (err) {
      console.error("❌ Error updating order:", err);
    }
  };

  if (loading) return <p className="orders-loading">Loading your orders...</p>;

  return (
    <div className="orders-layout">
      <BuyerSidebar />
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
                <tr key={order._id}>
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
                  <td>{order.product?.name}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.total}</td>
                  <td>
                    <span className={`status ${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn edit-btn"
                      onClick={() => handleUpdate(order._id)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn delete-btn"
                      onClick={() => handleDelete(order._id)}
                    >
                      🗑️ Delete
                    </button>
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
