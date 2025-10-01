// apps/frontend/src/pages/Agent/Profile/AgentProfile.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import AgentSidebar from "../../../components/AgentSidebar";
import "../../../pages/Agent/Agent.css";
import "./AgentProfile.css";
import { motion } from "framer-motion";
import { slideInLeft } from "../../Agent/animation";

export default function AgentProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", region: "" });

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/agents/profile");
      setProfile(data.user || data);
      setForm({ fullName: data.user?.fullName || data.fullName || "", phone: data.user?.phone || data.phone || "", region: data.user?.region || data.region || ""});
    } catch (err) {
      console.error("profile fetch", err);
      alert("Failed to load profile");
    }
  };

  useEffect(()=> { fetchProfile() }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put("/agents/profile", form);
      alert("Profile updated");
      setEditing(false);
      fetchProfile();
      // update localStorage user
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const newUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (err) {
      console.error("update profile", err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="agent-layout">
      <AgentSidebar />
      <main className="agent-main">
        <motion.div initial="hidden" animate="visible" variants={slideInLeft}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <h2>My Profile</h2>
            <div>
              <button className="btn" onClick={() => setEditing(e => !e)}>{editing ? "Cancel" : "Edit"}</button>
            </div>
          </div>

          <div className="panel">
            {profile ? (
              <>
                {!editing ? (
                  <div>
                    <p><strong>Name:</strong> {profile.fullName || profile.name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Phone:</strong> {profile.phone || "-"}</p>
                    <p><strong>Region:</strong> {profile.region || "-"}</p>
                    <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSave} style={{display:"grid", gap:10, maxWidth:540}}>
                    <input className="input" value={form.fullName} onChange={(e)=>setForm({...form, fullName:e.target.value})} required />
                    <input className="input" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
                    <input className="input" value={form.region} onChange={(e)=>setForm({...form, region:e.target.value})} />
                    <div style={{display:"flex", gap:8}}>
                      <button className="btn" type="submit">Save</button>
                      <button className="btn secondary" type="button" onClick={()=>{ setEditing(false); fetchProfile(); }}>Cancel</button>
                    </div>
                  </form>
                )}
              </>
            ) : <p>Loading profile...</p>}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
