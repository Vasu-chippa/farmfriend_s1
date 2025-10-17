import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "./FarmerDashboard.css";

const POLL_INTERVAL = 30000; // 30 seconds

const FarmerDashboard = () => {
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalExpenses: 0,
    profitOrLoss: 0,
    totalHarvest: 0,
    totalIncome: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Assuming endpoint returns stats as in your backend controller
      const res = await API.get("/farmers/stats");
      const {
        totalCrops,
        totalHarvest,
        totalExpenses,
        totalIncome,
        profitOrLoss,
      } = res.data;

      setStats({
        totalCrops,
        totalHarvest,
        totalExpenses,
        expectedRevenue: totalIncome,
        profit: profitOrLoss,
      });

      setNotifications([
        // 🔑 Notification text updated for clarity
        { id: 1, text: `${totalHarvest} units of crops are ready for market.` },
        { id: 2, text: `Expected revenue: ₹${totalIncome}` },
      ]);

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching stats", err);
      setNotifications([
        { id: 0, text: "Failed to load stats. Please try again later." }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
<<<<<<< HEAD
=======
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
>>>>>>> 4480506761132cab8ea8e9e83e5a14ad937448ed
    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { name: "Expenses", value: stats.totalExpenses },
    { name: "Revenue", value: stats.expectedRevenue },
  ];

  const farmerName = localStorage.getItem("farmerName") || "Farmer";

  const getProfitStyle = (profit) =>
    profit > 0 ? { color: "#388e3c", fontWeight: 700 }
      : profit < 0 ? { color: "#d32f2f", fontWeight: 700 }
      : { color: "#333", fontWeight: 700 };

  return (
    <div className="farmer-dashboard">
      <h2>👨‍🌾 Welcome, {farmerName}</h2>

      {/* Last updated */}
      <div className="last-updated">
        {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
      </div>

      {/* Loader */}
      {loading && (
        <div className="spinner" style={{ margin: "16px 0" }}>
          <div className="loader"></div>
        </div>
      )}

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
<<<<<<< HEAD
          <p style={getProfitStyle(stats.profit)}>
            {stats.profit >= 0 ? `+ ₹${stats.profit}` : `- ₹${Math.abs(stats.profit)}`}
          </p>
=======
          <p>{stats.profitOrLoss >= 0 ? `+ ₹${stats.profitOrLoss}` : `- ₹${Math.abs(stats.profitOrLoss)}`}</p>
>>>>>>> 4480506761132cab8ea8e9e83e5a14ad937448ed
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
        {/* 🔑 Conditional render check for Recharts stability */}
        {!loading && chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
            // Fallback text if no data is available after loading
            !loading && <p>No financial data to display yet.</p>
        )}
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