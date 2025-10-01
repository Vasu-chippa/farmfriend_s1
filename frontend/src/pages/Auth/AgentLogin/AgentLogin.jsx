import React, { useState } from "react";
// import axios from "axios";
import API from "../../../api"; // ✅ api instance
import "../Auth.css";  // ✅ common css

function AgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const { data } = await API.post("/agents/login", { email, password });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("Login successful");
    window.location.href = "/agent/dashboard";
  } catch (err) {
    alert(err.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="auth-container">
      <h2>Agent Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AgentLogin;
