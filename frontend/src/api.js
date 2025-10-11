// frontend/src/api.js
import axios from "axios";
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://farmfriend.onrender.com/api",
}); // Add token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default API;
