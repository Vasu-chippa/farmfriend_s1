// apps/backend/src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * protect middleware:
 * - verifies token
 * - sets req.user = { _id, id, role } (normalized)
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let headerToken = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (headerToken && /^(null|undefined|\s*)$/i.test(headerToken)) {
      headerToken = null;
    }
    const cookieToken = req.cookies?.token || null;

    let token = headerToken || cookieToken;
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // If bearer token is invalid, but a cookie token exists, fall back to cookie auth.
      if (headerToken && cookieToken) {
        decoded = jwt.verify(cookieToken, process.env.JWT_SECRET);
      } else {
        throw error;
      }
    }

    const userId = decoded._id || decoded.id || decoded.userId || decoded.uid;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found, authorization denied" });
    }

    req.user = {
      ...decoded,
      _id: userId,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth protect error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// restrict roles
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied: insufficient role" });
  }
  next();
};
