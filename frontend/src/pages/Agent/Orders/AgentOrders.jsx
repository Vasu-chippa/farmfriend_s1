// apps/frontend/src/pages/Agent/Orders/AgentOrders.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import AgentSidebar from "../../../components/AgentSidebar";
import "../../../pages/Agent/Agent.css";
import "./AgentOrders.css";
import { motion } from "framer-motion";
import { fadeInUp } from "../../Agent/animation";

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/agents/orders");
      setOrders(data || []);
    } catch (err) {
      console.error("fetch orders", err);
      alert("Failed to fetch orders");
    } finally { setLoading(false); }
  };

  useEffect(()=> { fetchOrders() }, []);

  const approveOrder = async (id, approve) => {
    if (!window.confirm(`${approve ? "Approve" : "Reject"} order?`)) return;
    try {
      await API.put(`/agents/orders/${id}/approve`, { approve });
      fetchOrders();
      alert("Order updated");
    } catch (err) {
      console.error("approve order", err);
      alert("Failed to update");
    }
  };

  const changeStatus = async (id, status) => {
    if (!window.confirm(`Set status to ${status}?`)) return;
    try {
      await API.put(`/agents/orders/${id}/status`, { status });
      fetchOrders();
      alert("Order status updated");
    } catch (err) {
      console.error("update status", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="agent-layout">
      <AgentSidebar />
      <main className="agent-main">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <h2>Orders</h2>
            <div><button className="btn" onClick={fetchOrders}>Refresh</button></div>
          </div>

          <div className="panel table">
            {loading ? <p>Loading orders...</p> :
              <table>
                <thead>
                  <tr>
                    <th>Order</th><th>Product</th><th>Farmer</th><th>Buyer</th><th>Qty</th><th>Total</th><th>Status</th><th>Approved</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? <tr><td colSpan={9}>No orders</td></tr> :
                    orders.map(o => (
                      <tr key={o._id}>
                        <td>{o._id}</td>
                        <td>{o.product?.name}</td>
                        <td>{o.farmer?.fullName || o.farmer?.name}</td>
                        <td>{o.buyer?.fullName || o.buyer?.email}</td>
                        <td>{o.quantity}</td>
                        <td>₹{o.total}</td>
                        <td><span className="pill">{o.status}</span></td>
                        <td>{o.approved ? <span className="tag-approved">Yes</span> : <span className="tag-pending">No</span>}</td>
                        <td style={{display:"flex", gap:8}}>
                          <button className="btn secondary" onClick={() => approveOrder(o._id, !o.approved)}>{o.approved ? "Unapprove" : "Approve"}</button>
                          <select className="input" defaultValue={o.status || "Pending"} onChange={(e)=>changeStatus(o._id, e.target.value)}>
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            }
          </div>
        </motion.div>
      </main>
    </div>
  );
}
