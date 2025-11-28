const jwt = require("jsonwebtoken");

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expecting Bearer token
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    }

    // ✅ Properly Decode JWT
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // ✅ Validate Token Structure (role must be admin)
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Not an admin" });
    }

    // ✅ Ensure we have an ID or email for identification
    if (!decoded.id && !decoded.email) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid Token" });
    }

    // Attach decoded admin info to both req.admin and req.user (for compatibility)
    req.admin = decoded;
    req.user = { id: decoded.id || decoded.email }; // Use ID, fallback to email
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};

module.exports = adminAuth;