import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

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

// ==========================
// uploads folder ensure
// ==========================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadsPath = path.join(__dirname, "uploads")

if (!fs.existsSync(uploadsPath)) {
fs.mkdirSync(uploadsPath, { recursive: true })
}

// serve uploads
app.use("/uploads", express.static(uploadsPath))

// ==========================
// API routes
// ==========================

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/reels", reelsRoutes)

// ==========================
// start server
// ==========================

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})