// apps/backend/src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * protect middleware:
 * - verifies token
 * - sets req.user = { _id, id, role } (normalized)
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // normalized user object: always provide _id
    req.user = {
      ...decoded,
      _id: decoded._id || decoded.id || decoded.userId || decoded.uid,
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
