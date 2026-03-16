import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import searchRoutes from "./routes/searchRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import reelsRoutes from "./routes/reelsRoutes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// connect database
connectDB()

// routes
app.use("/api/reels",reelsRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/posts", postRoutes)

// static uploads folder
app.use("/uploads", express.static("uploads"))

app.listen(5000, () => {
console.log("Server running on port 5000")
})