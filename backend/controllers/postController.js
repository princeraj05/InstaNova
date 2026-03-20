import Post from "../models/Post.js"
import mongoose from "mongoose"
import Notification from "../models/Notification.js"
import User from "../models/User.js"
import { io } from "../server.js"

// ==============================
// CREATE POST / REEL
// ==============================
export const createPost = async (req, res) => {
  try {
    const { caption, mediaType, userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: "UserId required" })
    }

    if (!req.file) {
      return res.status(400).json({ message: "Media file required" })
    }

    const newPost = new Post({
      user: new mongoose.Types.ObjectId(userId),
      media: req.file.path,
      mediaType: mediaType || "post",
      caption
    })

    await newPost.save()

    // 🔥 NOTIFY FOLLOWERS
    const followers = await User.find({ following: userId })

    for (let f of followers) {
      const notif = await Notification.create({
        recipient: f._id,
        sender: userId,
        type: "post",
        post: newPost._id,
        message: mediaType === "reel"
          ? "uploaded a new reel"
          : "uploaded a new post"
      })

      // 🔥 POPULATE BEFORE EMIT (IMPORTANT FIX)
      const populatedNotif = await Notification.findById(notif._id)
        .populate("sender", "username profilePic")
        .populate("post", "media")

      io.emit("newNotification", populatedNotif)
    }

    res.status(201).json(newPost)

  } catch (err) {
    console.log("Create Post Error:", err)
    res.status(500).json({ message: "Server error" })
  }
}

// ==============================
// GET USER POSTS
// ==============================
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

// ==============================
// GET ALL POSTS
// ==============================
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}