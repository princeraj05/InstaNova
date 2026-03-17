export { io }
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import http from "http"
import { Server } from "socket.io"

import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import searchRoutes from "./routes/searchRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import reelsRoutes from "./routes/reelsRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import conversationRoutes from "./routes/conversationRoutes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// DB connect
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

app.use("/uploads", express.static(uploadsPath))

// ==========================
// API routes
// ==========================

app.use("/api/messages", messageRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/reels", reelsRoutes)

// ==========================
// SOCKET.IO SETUP
// ==========================

// ❗ IMPORTANT: http server banana hoga
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

let users = []

const addUser = (userId, socketId) => {
  if (!users.some(user => user.userId === userId)) {
    users.push({ userId, socketId })
  }
}

const getUser = (userId) => {
  return users.find(user => user.userId === userId)
}

const removeUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId)
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // add user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id)
    io.emit("getUsers", users)
  })

  // send message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId)

    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text
      })
    }
  })

  // disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
    removeUser(socket.id)
    io.emit("getUsers", users)
  })
})

// ==========================
// START SERVER
// ==========================

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})