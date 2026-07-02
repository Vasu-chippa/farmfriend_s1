import axios from "axios";
const envApiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "https://farmfriend-s1-vjn8.onrender.com/api";
const API = axios.create({
  // In local development use the CRA proxy, otherwise use the configured API base URL.
  baseURL: envApiUrl,
  withCredentials: true, // send cookies for auth
});

const getApiBaseUrl = () => envApiUrl.replace(/\/api\/?$/i, "");
export const getBackendImageUrl = (src) => {
  if (!src) return "";
  return src.startsWith("http") ? src : `${getApiBaseUrl()}${src}`;
};

// Sanitize Authorization header and attach token from localStorage only when present.
API.interceptors.request.use((config) => {
  try {
    const hdr = config.headers && (config.headers.Authorization || config.headers.authorization);
    // Remove invalid bearer values like 'Bearer null' or 'Bearer undefined' which cause 401s
    if (hdr && /Bearer\s+(null|undefined|\s*)$/i.test(hdr)) {
      if (config.headers.Authorization) delete config.headers.Authorization;
      if (config.headers.authorization) delete config.headers.authorization;
    }
    const token = localStorage.getItem("token");
    if (token && !(config.headers && (config.headers.Authorization || config.headers.authorization))) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

API.interceptors.response.use(
  (response) => {
    try {
      const token = response?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
      }
    } catch (e) {
      // ignore storage errors
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default API;

// Helper to build auth config for API calls when needed by services/components.
export const authCfg = (overrides = {}) => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return { headers: { ...headers, ...(overrides.headers || {}) }, ...overrides };
  } catch (e) {
    return { headers: { ...(overrides.headers || {}) }, ...overrides };
  }
};

