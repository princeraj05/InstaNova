import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// 🔐 REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // check existing user (email OR username)
    const userExist = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (userExist) {
      return res.status(400).json({
        message: "User already exists"
      })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      email,
      password: hashed
    })

    res.status(201).json({
      message: "User registered successfully",
      user
    })

  } catch (err) {
    res.status(500).json({ message: "Register error", error: err.message })
  }
}

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Google users ke liye password skip
    if (user.password !== "google-auth") {
      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        return res.status(400).json({ message: "Invalid password" })
      }
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      message: "Login success",
      token,
      user
    })

  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message })
  }
}

// 🔥 GOOGLE AUTH (LOGIN + REGISTER)
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { email, name, picture } = payload

    let user = await User.findOne({ email })

    // 🆕 create if not exists
    if (!user) {
      user = await User.create({
        username: name,
        email,
        profilePic: picture,
        password: "google-auth",
      })
    }

    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      message: "Google login success",
      token: jwtToken,
      user
    })

  } catch (err) {
    res.status(500).json({
      message: "Google login failed",
      error: err.message
    })
  }
}