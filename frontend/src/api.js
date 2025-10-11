// frontend/src/api.js (FIXED)
import axios from "axios";

const API = axios.create({
  // 🔑 FIX: Set the base URL to just '/api' in development.
  // The 'package.json' proxy handles the 'http://localhost:5000' part,
  // and '/api' ensures the request hits the correct Express route path (e.g., /api/admins/farmers).
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api",
});

// Add token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;