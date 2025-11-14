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

    // ✅ Validate Token Structure
    if (!decoded.email || decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid Token" });
    }

    // Attach decoded admin info to `req.admin`
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};

module.exports = adminAuth;