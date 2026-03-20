import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization

    if (!token) {
      return res.status(401).json({ message: "No token" })
    }

    if (token.startsWith("Bearer")) {
      token = token.split(" ")[1]
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    req.user = user
    next()

  } catch (err) {
    console.log("Auth error:", err.message)
    res.status(401).json({ message: "Invalid token" })
  }
}