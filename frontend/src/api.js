import axios from "axios";

const API = axios.create({
  // Use '/api' for development (proxy in package.json), or REACT_APP_API_BASE_URL for production
  // No hardcoded credentials. Only use secure token from localStorage.
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api",
});

// Attach JWT token from localStorage if present
API.interceptors.request.use((config) => {
  // Secure: Only use token from localStorage, never hardcoded
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;