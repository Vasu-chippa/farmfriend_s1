// File: frontend/src/services/authService.js
import axios from "axios";

// Use environment-provided base URL in production, or default to relative
// '/api' for development (frontend proxy). This prevents hardcoding the
// production Render URL which causes local development to hit the remote
// server and can lead to "server error" when developing locally.
const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "/api";
const api = axios.create({
  baseURL: `${API_BASE}/auth`,
  withCredentials: true,
});
// ===== Auth Functions =====
export const register = async (data) => {
  const res = await api.post("/register", data);
  // server sets cookie; response includes user
  return res.data;
};
export const login = async (data) => {
  const res = await api.post("/login", data);
  // server sets cookie; response includes user
  return res.data;
};
export const getCurrentUser = async () => {
  try {
    const res = await api.get("/me");
    return res.data.user || null;
  } catch (err) {
    return null;
  }
};
export const logout = async () => {
  try {
    await api.post("/logout");
    return true;
  } catch (err) {
    return false;
  }
};
const authService = {
  register,
  login,
  getCurrentUser,
  logout,
};
export default authService;
