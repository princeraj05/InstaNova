import Post from "../models/Post.js"
import mongoose from "mongoose"

// ✅ CREATE POST
export const createPost = async (req, res) => {
  try {
    const { caption, mediaType, userId } = req.body

    // validation
    if (!userId) {
      return res.status(400).json({ message: "UserId required" })
    }

    if (!req.file) {
      return res.status(400).json({ message: "Media file required" })
    }

    // ✅ FINAL (Cloudinary support)
    const newPost = new Post({
      user: new mongoose.Types.ObjectId(userId),
      media: req.file.path, // 🔥 Cloudinary URL
      mediaType: mediaType || "post",
      caption
    })

    await newPost.save()

    res.status(201).json(newPost)

  } catch (err) {
    console.log("Create Post Error:", err)
    res.status(500).json({ message: "Server error" })
  }
}

// ✅ GET USER POSTS
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.params.id
    }).sort({ createdAt: -1 })

    res.json(posts)

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" })
  }
}

// ✅ GET ALL POSTS (Feed)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })

    res.json(posts)

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" })
  }
}