// apps/frontend/src/pages/Agent/Marketplace/AgentMarketplace.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api";
import AgentSidebar from "../../../components/AgentSidebar";
import "../../../pages/Agent/Agent.css";
import "./AgentMarketplace.css";
import { motion } from "framer-motion";
import { slideInRight } from "../../Agent/animation";

export default function AgentMarketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/agents/products"); // your endpoint
      setProducts(data || []);
    } catch (err) {
      console.error("fetch products", err);
      alert("Failed to fetch products");
    } finally { setLoading(false); }
  };

  useEffect(()=> { fetchProducts() }, []);

  const toggleApprove = async (id, approve) => {
    if (!window.confirm(`${approve ? "Approve" : "Unapprove"} product?`)) return;
    try {
      await API.put(`/agents/products/${id}/approve`, { approve });
      fetchProducts();
      alert("Product status updated");
    } catch (err) {
      console.error("approve product", err);
      alert("Failed to update product");
    }
  };

  return (
    <div className="agent-layout">
      <AgentSidebar />
      <main className="agent-main">
        <motion.div initial="hidden" animate="visible" variants={slideInRight}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <h2>Marketplace (My Farmers)</h2>
            <div><button className="btn" onClick={fetchProducts}>Refresh</button></div>
          </div>

          <div className="panel">
            {loading ? <p>Loading products...</p> :
              products.length === 0 ? <p>No products found.</p> :
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12}}>
                {products.map(p => (
                  <div key={p._id} className="panel" style={{display:"flex", flexDirection:"column", gap:8}}>
                    <div style={{display:"flex", gap:12, alignItems:"center"}}>
                      <div style={{width:72,height:72,background:"#eef2ff",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {/* image placeholder */}
                        {p.images && p.images.length ? <img src={p.images[0].startsWith("http") ? p.images[0] : `${(process.env.REACT_APP_API_URL||"")?.replace("/api","")}/uploads/${p.images[0].replace(/^\/?uploads\//,"")}`} alt="img" style={{width:68,height:68,objectFit:"cover",borderRadius:6}} /> : <div style={{fontSize:12,color:"#2563eb"}}>Image</div>}
                      </div>
                      <div style={{flex:1}}>
                        <h3 style={{margin:0}}>{p.name}</h3>
                        <p className="small">{p.description}</p>
                        <div className="small">Farmer: {p.farmer?.fullName || p.farmer?.name || "—"}</div>
                        <div style={{marginTop:8}}><strong>₹{p.price}</strong> • {p.quantity} kg</div>
                      </div>
                    </div>

                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6}}>
                      <div className={p.approved ? "tag-approved" : "tag-pending"}>{p.approved ? "Approved" : "Pending"}</div>
                      <div style={{display:"flex", gap:8}}>
                        <button className="btn secondary" onClick={()=>toggleApprove(p._id, !p.approved)}>{p.approved ? "Unapprove" : "Approve"}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </motion.div>
      </main>
    </div>
  );
}
