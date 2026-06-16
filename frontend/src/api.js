import axios from "axios";
const API = axios.create({
  // Prefer explicit production URL `REACT_APP_API_URL`, fallback to the
  // older `REACT_APP_API_BASE_URL`, and finally use '/api' for local dev
  baseURL: process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "/api",
  withCredentials: true, // send cookies for auth
});
export default API;

