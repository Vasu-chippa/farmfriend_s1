import API from "../api";

let cachedUser = null;

// Fetch current user from server (reads auth cookie)
export const fetchCurrentUser = async () => {
  try {
    const res = await API.get("/auth/me");
    cachedUser = res.data.user || null;
    return cachedUser;
  } catch (err) {
    cachedUser = null;
    return null;
  }
};

// Logout by clearing cookie on server
export const logout = async () => {
  try {
    await API.post("/auth/logout");
    cachedUser = null;
    return true;
  } catch (err) {
    cachedUser = null;
    return false;
  }
};

// Compatibility helpers (previous API used localStorage)
export const setAuth = async (tokenOrUser, maybeUser) => {
  // signature: setAuth(token, user) or setAuth(user)
  const user = maybeUser || tokenOrUser;
  cachedUser = user || null;
  // Do not store token client-side; server sets httpOnly cookie on login
  return cachedUser;
};

export const clearAuth = () => {
  // clear cache and fire logout request in background
  cachedUser = null;
  logout();
};

export const getUser = () => cachedUser;

export const isAuthenticated = () => !!cachedUser;

export const getRole = () => cachedUser?.role || null;

// Return Authorization header only when a token is present in localStorage.
// This avoids sending `Authorization: Bearer null` which causes 401 errors
// when the server expects either a cookie or a valid token.
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const auth = {
  fetchCurrentUser,
  logout,
  setAuth,
  clearAuth,
  getUser,
  isAuthenticated,
  getRole,
};

export default auth;
