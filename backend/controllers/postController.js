import Post from "../models/Post.js"
import mongoose from "mongoose"
import Notification from "../models/Notification.js"
import User from "../models/User.js"
import Comment from "../models/Comment.js"
import { io } from "../server.js"

// ==============================
// CREATE POST
// ==============================
export const createPost = async (req, res) => {
  try {
    const { caption, mediaType, userId } = req.body

    if (!userId) return res.status(400).json({ message: "UserId required" })
    if (!req.file) return res.status(400).json({ message: "Media required" })

    const newPost = new Post({
      user: new mongoose.Types.ObjectId(userId),
      media: req.file.path,
      mediaType: mediaType || "post",
      caption
    })

    await newPost.save()

    const followers = await User.find({ following: userId })

    for (let f of followers) {
      const notif = await Notification.create({
        recipient: f._id,
        sender: userId,
        type: "post",
        post: newPost._id,
        message: "uploaded a new post"
      })

      const populated = await Notification.findById(notif._id)
        .populate("sender", "username profilePic")
        .populate("post", "media")

      io.emit("newNotification", populated)
    }

    res.status(201).json(newPost)

  } catch (err) {
    console.log(err)
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
  } catch {
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
  } catch {
    res.status(500).json({ message: "Server error" })
  }
}

// ==============================
// 🔥 GET SAVED POSTS
// ==============================
export const getSavedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ savedBy: req.params.userId })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" })
  }
}

// ==============================
// ❤️ LIKE
// ==============================
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    const { userId } = req.body

    if (!post) return res.status(404).json({ message: "Post not found" })

    const index = post.likes.findIndex(id => id.toString() === userId)

    if (index === -1) post.likes.push(userId)
    else post.likes.splice(index, 1)

    await post.save()

    res.json({
      liked: index === -1,
      likes: post.likes
    })

  } catch {
    res.status(500).json({ message: "Server error" })
  }
}

// ==============================
// 🔖 SAVE
// ==============================
export const toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    const { userId } = req.body

    if (!post) return res.status(404).json({ message: "Post not found" })

    if (!post.savedBy) post.savedBy = []

    const index = post.savedBy.findIndex(id => id.toString() === userId)

    if (index === -1) post.savedBy.push(userId)
    else post.savedBy.splice(index, 1)

    await post.save()

    res.json({ saved: index === -1 })

  } catch {
    res.status(500).json({ message: "Server error" })
  }
}

// ==============================
// 💬 GET COMMENTS
// ==============================
export const getPostComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })

    res.json(comments)

  } catch {
    res.status(500).json({ message: "Server error" })
  }
}

// ==============================
// 💬 ADD COMMENT
// ==============================
export const addComment = async (req, res) => {
  try {
    const { text, userId } = req.body

    if (!text) return res.status(400).json({ message: "Text required" })

    const comment = await Comment.create({
      post: req.params.id,
      user: userId,
      text
    })

    const populated = await Comment.findById(comment._id)
      .populate("user", "username profilePic")

    res.json(populated)

  } catch {
    res.status(500).json({ message: "Server error" })
  }
}