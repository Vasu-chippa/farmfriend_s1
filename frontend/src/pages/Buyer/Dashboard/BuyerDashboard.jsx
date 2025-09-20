import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuyerSidebar from "../../../components/BuyerSidebar";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "./BuyerDashboard.css";

const BuyerDashboard = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/buyers/orders", {
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

  if (loading) return <p>Loading Dashboard...</p>;

  // 🔹 Dashboard Metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;

  // 🔹 Spending Trend (group by month)
  const spendingData = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt);
    const month = date.toLocaleString("default", { month: "short" });

    const existing = acc.find((d) => d.month === month);
    if (existing) {
      existing.amount += order.total;
    } else {
      acc.push({ month, amount: order.total });
    }
    return acc;
  }, []);

  // 🔹 Orders Status Data
  const orderStatusData = [
    { name: "Completed", value: completedOrders },
    { name: "Pending", value: pendingOrders },
  ];

  const COLORS = ["#4CAF50", "#FFC107"];

  return (
    <div className="buyer-layout">
      <BuyerSidebar />
      <div className="buyer-dashboard-content">
        <h2>📊 Buyer Dashboard</h2>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="card">
            <h3>Total Orders</h3>
            <p>{totalOrders}</p>
          </div>
          <div className="card">
            <h3>Pending Orders</h3>
            <p>{pendingOrders}</p>
          </div>
          <div className="card">
            <h3>Completed Orders</h3>
            <p>{completedOrders}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          <div className="chart-box">
            <h3>💰 Spending Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#007bff" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>📦 Orders Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="btn" onClick={() => navigate("/buyer/marketplace")}>
            🛒 Marketplace
          </button>
          <button className="btn" onClick={() => navigate("/buyer/orders")}>
            📦 My Orders
          </button>
          <button className="btn" onClick={() => navigate("/buyer/profile")}>
            👤 Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
