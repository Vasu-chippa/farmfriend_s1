// apps/frontend/src/pages/Agent/Orders/AgentOrders.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import "../../../pages/Agent/Agent.css";
import "./AgentOrders.css";
import { motion } from "framer-motion";
import { fadeInUp } from "../../Agent/animation";

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/agents/orders");
      setOrders(data || []);
    } catch (err) {
      console.error("fetch orders", err);
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const approveOrder = async (id, approve) => {
    if (!window.confirm(`${approve ? "Approve" : "Reject"} this order?`)) return;
    try {
      await API.put(`/agents/orders/${id}/approve`, { approve });
      fetchOrders();
      alert("Order updated successfully!");
    } catch (err) {
      console.error("approve order", err);
      alert("Failed to update order approval");
    }
  };

  const changeStatus = async (id, status) => {
    if (!window.confirm(`Set status to ${status}?`)) return;
    try {
      await API.put(`/agents/orders/${id}/status`, { status });
      fetchOrders();
      alert("Order status updated!");
    } catch (err) {
      console.error("update status", err);
      alert("Failed to update status");
    }
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter((o) =>
    filter === "All" ? true : o.status === filter
  );

  return (
    <div className="agent-layout">
      <main className="agent-main">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2>Orders</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                className="input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
              <button className="btn" onClick={fetchOrders}>
                Refresh
              </button>
            </div>
          </div>

          <div className="panel table">
            {loading ? (
              <p>Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <p>No orders found for selected filter.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Farmer</th>
                    <th>Buyer</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Approved</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o._id}>
                      <td>{o._id}</td>
                      <td>{o.product?.name || "—"}</td>
                      <td>{o.product?.farmer?.fullName || "—"}</td>
                      <td>{o.buyer?.fullName || o.buyer?.email || "—"}</td>
                      <td>{o.quantity}</td>
                      <td>₹{o.total}</td>
                      <td>
                        <span
                          className={`pill ${
                            o.status === "Delivered"
                              ? "pill-success"
                              : o.status === "Cancelled"
                              ? "pill-danger"
                              : "pill-pending"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td>
                        {o.approved ? (
                          <span className="tag-approved">Yes</span>
                        ) : (
                          <span className="tag-pending">No</span>
                        )}
                      </td>
                      <td style={{ display: "flex", gap: 8 }}>
                        <button
                          className={`btn ${
                            o.approved ? "danger" : "secondary"
                          }`}
                          onClick={() => approveOrder(o._id, !o.approved)}
                        >
                          {o.approved ? "Unapprove" : "Approve"}
                        </button>
                        <select
                          className="input"
                          value={o.status || "Pending"}
                          onChange={(e) =>
                            changeStatus(o._id, e.target.value)
                          }
                        >
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
