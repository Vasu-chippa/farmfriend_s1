import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FarmerExpense.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from "recharts";

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    cropName: "",
    category: "Seeds",
    amount: "",
    date: "",
    description: ""
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/farmers/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("❌ Error fetching expenses:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/farmers/expenses/${editId}`, formData);
        alert("✅ Expense updated");
      } else {
        await axios.post("http://localhost:5000/api/farmers/expenses", formData);
        alert("✅ Expense added");
      }
      setFormData({ cropName: "", category: "Seeds", amount: "", date: "", description: "" });
      setEditId(null);
      fetchExpenses();
    } catch (err) {
      console.error("❌ Error saving expense:", err);
      alert("❌ Failed to save expense");
    }
  };

  const handleEdit = (expense) => {
    setEditId(expense._id);
    setFormData({
      cropName: expense.cropName,
      category: expense.category,
      amount: expense.amount,
      date: expense.date.split("T")[0],
      description: expense.description
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/farmers/expenses/${id}`);
      alert("🗑️ Expense deleted");
      fetchExpenses();
    } catch (err) {
      console.error("❌ Error deleting expense:", err);
    }
  };

  // Chart Data
  const categoryData = expenses.reduce((acc, exp) => {
    const found = acc.find((c) => c.category === exp.category);
    if (found) {
      found.amount += exp.amount;
    } else {
      acc.push({ category: exp.category, amount: exp.amount });
    }
    return acc;
  }, []);

  const timeData = expenses.map((exp) => ({
    date: new Date(exp.date).toLocaleDateString(),
    amount: exp.amount
  }));

  return (
    <div className="expense-container">
      {/* Left Form */}
      <div className="expense-form-card">
        <h2>➕ Add Expense</h2>
        <form onSubmit={handleSubmit} className="expense-form">
          <input type="text" name="cropName" placeholder="Crop Name"
            value={formData.cropName} onChange={handleChange} required />
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="Seeds">Seeds</option>
            <option value="Fertilizer">Fertilizer</option>
            <option value="Labor">Labor</option>
            <option value="Transport">Transport</option>
            <option value="Water">Water</option>
            <option value="Equipment">Equipment</option>
            <option value="Others">Others</option>
          </select>
          <input type="number" name="amount" placeholder="Amount (₹)"
            value={formData.amount} onChange={handleChange} required />
          <input type="date" name="date" value={formData.date}
            onChange={handleChange} required />
          <textarea name="description" placeholder="Description"
            value={formData.description} onChange={handleChange}></textarea>
          <button type="submit">{editId ? "Update Expense" : "Add Expense"}</button>
        </form>
      </div>

      {/* Right Charts */}
      <div className="expense-charts-card">
        <h2>📊 Visualization</h2>
        <div className="chart">
          <h4>By Category</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h4>Over Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#2196F3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Width Table */}
      <div className="expense-table-card">
        <h2>📑 Expense Records</h2>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Category</th>
              <th>Amount (₹)</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{exp.cropName}</td>
                  <td>{exp.category}</td>
                  <td>₹{exp.amount}</td>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.description}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(exp)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(exp._id)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6">No expenses added yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseTracker;