// apps/frontend/src/pages/Agent/Farmers/AgentFarmers.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import AgentSidebar from "../../../components/AgentSidebar";
import "../../../pages/Agent/Agent.css";
import "./AgentFarmers.css";
import { motion } from "framer-motion";
import { slideInLeft } from "../../Agent/animation";

export default function AgentFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName:"", email:"", phone:"", password:"" });

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/agents/farmers");
      setFarmers(data || []);
    } catch (err) {
      console.error("fetch farmers error", err);
      alert("Failed to fetch farmers");
    } finally { setLoading(false); }
  };

  useEffect(()=> { fetchFarmers() }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/agents/farmers", form);
      setForm({ fullName:"", email:"", phone:"", password:"" });
      setShowAdd(false);
      fetchFarmers();
      alert("Farmer created");
    } catch (err) {
      console.error("create farmer", err);
      alert(err.response?.data?.message || "Failed to create");
    }
  };

  const toggleVerify = async (farmerId, verify) => {
    if (!window.confirm(`${verify ? "Verify" : "Unverify"} farmer?`)) return;
    try {
      await API.put("/agents/farmers/verify", { farmerId, verify });
      fetchFarmers();
    } catch (err) {
      console.error("verify farmer", err);
      alert("Failed to update farmer");
    }
  };

  return (
    <div className="agent-layout">
      <AgentSidebar />
      <main className="agent-main">
        <motion.div initial="hidden" animate="visible" variants={slideInLeft}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <h2>Farmers</h2>
            <div>
              <button className="btn" onClick={() => setShowAdd(s=>!s)}>{showAdd ? "Close" : "Add Farmer"}</button>
            </div>
          </div>

          {showAdd && (
            <form className="panel" onSubmit={handleCreate} style={{marginBottom:12}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                <input className="input" placeholder="Full name" value={form.fullName} onChange={(e)=>setForm({...form, fullName:e.target.value})} required />
                <input className="input" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
                <input className="input" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
                <input className="input" placeholder="Password (temp)" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} />
              </div>
              <div style={{marginTop:10}}>
                <button className="btn" type="submit">Create</button>
              </div>
            </form>
          )}

          <div className="panel table">
            {loading ? <p>Loading farmers...</p> :
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Verified</th><th>Action</th></tr></thead>
                <tbody>
                  {farmers.length === 0 ? <tr><td colSpan={5}>No farmers assigned.</td></tr> :
                    farmers.map(f => (
                      <tr key={f._id}>
                        <td>{f.fullName || f.name}</td>
                        <td>{f.email}</td>
                        <td>{f.phone || "-"}</td>
                        <td>{f.verified ? <span className="tag-approved">Verified</span> : <span className="tag-pending">Pending</span>}</td>
                        <td>
                          <button className="btn secondary" onClick={()=>toggleVerify(f._id, !f.verified)}>
                            {f.verified ? "Unverify" : "Verify"}
                          </button>
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
