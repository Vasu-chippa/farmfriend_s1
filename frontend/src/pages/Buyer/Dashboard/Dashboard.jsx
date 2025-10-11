import React, { useEffect, useState } from "react";
import API from "../../../api";
import { useNavigate } from "react-router-dom";
import BuyerSidebar from "../../components/BuyerSidebar";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    API.get("/buyer/orders", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const orders = res.data || [];
      setStats({
        total: orders.length,
        active: orders.filter(o => o.status === "Pending").length,
        completed: orders.filter(o => o.status === "Completed").length,
      });
      setRecentOrders(orders.slice(0, 3));
    }).catch(err => {
      console.error("Error fetching orders:", err);
    });
  }, []);

  return (
    <div className="buyer-layout">
      <BuyerSidebar />
      <div className="buyer-main">
        <h2>Buyer Dashboard</h2>
        <div className="stats-grid">
          <div className="stat-card">Total Orders: {stats.total}</div>
          <div className="stat-card">Active Orders: {stats.active}</div>
          <div className="stat-card">Completed Orders: {stats.completed}</div>
        </div>
        <h3>Recent Orders</h3>
        {recentOrders.map(order => (
          <div key={order._id} className="order-card">
            <p>Order ID: {order._id}</p>
            <p>Status: {order.status}</p>
            <button onClick={() => navigate(`/buyer/orders/${order._id}`)}>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
