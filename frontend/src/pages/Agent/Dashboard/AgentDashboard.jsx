// apps/frontend/src/pages/Agent/Dashboard/AgentDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import AgentSidebar from "../../../components/AgentSidebar";
import "../../../pages/Agent/Agent.css";
import "./AgentDashboard.css";
import { motion } from "framer-motion";
import { fadeInUp } from "../../Agent/animation";

function MiniBar({data, title}) {
  const items = Object.entries(data || {});
  const max = Math.max(...items.map(([,v])=>v),1);
  return (
    <div>
      <h4>{title}</h4>
      <div className="mini-bars">
        {items.length === 0 ? <small className="small">No data</small> :
          items.map(([k,v])=>(
            <div key={k} className="mini-bar-item">
              <div className="bar" style={{height: `${(v/max)*100}px`}} />
              <div className="label">{k}</div>
              <div className="value small">{v}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const [stats, setStats] = useState({ farmers:0, products:0, orders:0, commissionEarned:0, regionStats:{}, monthlyStats:{} });
  const [loading, setLoading] = useState(true);
  const [error,setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/agents/dashboard");
      // backend returns { farmers, products, orders, commissionEarned, regionStats, monthlyStats }
      setStats({
        farmers: data.farmers || 0,
        products: data.products || 0,
        orders: data.orders || 0,
        commissionEarned: data.commissionEarned || 0,
        regionStats: data.regionStats || {},
        monthlyStats: data.monthlyStats || {}
      });
    } catch (err) {
      console.error("Dashboard fetch error", err);
      setError(err.response?.data?.message || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> { fetchStats() }, []);

  return (
    <div className="agent-layout">
      <AgentSidebar />
      <main className="agent-main">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
            <h2>Agent Dashboard</h2>
            <div>
              <button className="btn" onClick={fetchStats}>Refresh</button>
            </div>
          </div>

          {loading ? <div className="panel">Loading...</div> :
            error ? <div className="panel">Error: {error}</div> :
            <>
              <div className="kpi-grid">
                <div className="panel kpi"><div className="value">{stats.farmers}</div><div className="label">Farmers</div></div>
                <div className="panel kpi"><div className="value">{stats.products}</div><div className="label">Products</div></div>
                <div className="panel kpi"><div className="value">{stats.orders}</div><div className="label">Orders</div></div>
                <div className="panel kpi"><div className="value">₹{Number(stats.commissionEarned).toFixed(2)}</div><div className="label">Commission</div></div>
              </div>

              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                <div className="panel">
                  <MiniBar data={stats.regionStats} title="Region-wise (qty)" />
                </div>
                <div className="panel">
                  <MiniBar data={stats.monthlyStats} title="Monthly Commissions" />
                </div>
              </div>
            </>
          }
        </motion.div>
      </main>
    </div>
  );
}
