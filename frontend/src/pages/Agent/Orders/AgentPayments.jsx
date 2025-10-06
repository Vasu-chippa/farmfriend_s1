import React, { useEffect, useState } from "react";
import API from "../../../api";
import "../../../pages/Agent/Agent.css";
import "./AgentOrders.css";
import { motion } from "framer-motion";
import { fadeInUp } from "../../Agent/animation";

export default function AgentPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
     const { data } = await API.get("/agents/payments");

      // Later, if you have separate payments API, change it here
      setPayments(data || []);
    } catch (err) {
      console.error("fetch payments", err);
      alert("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "green";
      case "unpaid":
        return "red";
      case "refunded":
        return "orange";
      default:
        return "gray";
    }
  };

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
            <h2>Payments</h2>
            <button className="btn" onClick={fetchPayments}>
              Refresh
            </button>
          </div>

          <div className="panel table">
            {loading ? (
              <p>Loading payments...</p>
            ) : payments.length === 0 ? (
              <p>No payments found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Payment Date</th>
                    <th>Payment Amount</th>
                    <th>Order ID</th>
                    <th>Buyer Details</th>
                    <th>Payment Status</th>
                    <th>Payment Method</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>{p.transactionId || "—"}</td>
                      <td>
                        {p.paymentDate
                          ? new Date(p.paymentDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>₹{p.paymentAmount || 0}</td>
                      <td>{p._id}</td>
                      <td>
                        {p.buyer
                          ? `${p.buyer.fullName || ""} (${p.buyer.email})`
                          : "—"}
                      </td>
                      <td
                        style={{
                          color: getStatusColor(p.paymentStatus),
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {p.paymentStatus || "N/A"}
                      </td>
                      <td>{p.paymentMethod || "—"}</td>
                      <td>{p.notes || "—"}</td>
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
