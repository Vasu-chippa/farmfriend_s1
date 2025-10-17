// File: frontend/src/services/authService.js
import axios from "axios";
const API_URL = "https://farmfriend.onrender.com/api/auth";
const api = axios.create({
  baseURL: API_URL,
});
// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// ===== Auth Functions =====
export const register = async (data) => {
  const res = await api.post("/register", data);
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};
export const login = async (data) => {
  const res = await api.post("/login", data);
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
const authService = {
  register,
  login,
  getCurrentUser,
  logout,
};
export default authService;
