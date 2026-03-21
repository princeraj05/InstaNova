import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization

    // ❌ No token
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    // ✅ Extract token from "Bearer TOKEN"
    if (token.startsWith("Bearer")) {
      token = token.split(" ")[1]
    }

    // ❌ Invalid format
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" })
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // ✅ Get full user from DB
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // 🔥 IMPORTANT (for deleteAccount)
    req.user = user            // full user object
    req.userId = user._id      // direct id (easy access)

    next()

  } catch (err) {
    console.log("Auth error:", err.message)

    return res.status(401).json({
      message: "Token is not valid or expired"
    })
  }
}