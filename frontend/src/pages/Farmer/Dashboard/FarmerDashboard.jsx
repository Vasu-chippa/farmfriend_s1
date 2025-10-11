// farmfriend/apps/frontend/src/pages/Farmer/Dashboard/FarmerDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "./FarmerDashboard.css";

const FarmerDashboard = () => {
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalExpenses: 0,
    profitOrLoss: 0,
    totalHarvest: 0,
    totalIncome: 0,
  });

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/farmers/stats");
        setStats(res.data);
        setNotifications([
          { id: 1, text: `${res.data.totalHarvest} crops harvested.` },
          { id: 2, text: `Total income: ₹${res.data.totalIncome}` },
        ]);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: "Expenses", value: stats.totalExpenses },
    { name: "Revenue", value: stats.expectedRevenue },
  ];

  const farmerName = localStorage.getItem("farmerName") || "Farmer";

  return (
    <div className="farmer-dashboard">
      <h2>👨‍🌾 Welcome, {farmerName}</h2>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Crops</h3>
          <p>{stats.totalCrops}</p>
        </div>
        <div className="card">
          <h3>Total Harvested Crops</h3>
          <p>{stats.totalHarvest}</p>
        </div>
        <div className="card">
          <h3>Total Expenses</h3>
          <p>₹{stats.totalExpenses}</p>
        </div>
        <div className="card">
          <h3>Profit / Loss</h3>
          <p>{stats.profitOrLoss >= 0 ? `+ ₹${stats.profitOrLoss}` : `- ₹${Math.abs(stats.profitOrLoss)}`}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/farmer/crops" className="btn">🌱 My Crops</Link>
        <Link to="/farmer/harvest" className="btn">🌾 Harvest List</Link>
        <Link to="/farmer/expenses" className="btn">💰 Add Expense</Link>
        <Link to="/farmer/marketplace" className="btn">🛒 Marketplace</Link>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <h3>Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Notifications */}
      <div className="notifications">
        <h3>🔔 Notifications</h3>
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((n) => (
              <li key={n.id}>{n.text}</li>
            ))}
          </ul>
        ) : (
          <p>No notifications yet.</p>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
