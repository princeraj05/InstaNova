import express from "express"
import {
  getReels, toggleLike, getComments,
  addComment, toggleFollow, toggleSave
} from "../controllers/reelsController.js"
import { protect } from "../middleware/auth.js"
import Post from "../models/Post.js"
import User from "../models/User.js"

const router = express.Router()

// ── Named routes BEFORE /:id wildcard ──
router.get("/", protect, getReels)
router.post("/follow/:id", protect, toggleFollow)

// ── GET saved reels for a user ──
// Fetches from User.savedPosts and filters only mediaType === "reel"
router.get("/saved/:userId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: "savedPosts",
      match: { mediaType: "reel" },           // only reels
      populate: { path: "user", select: "username profilePic" }
    })

    if (!user) return res.status(404).json({ message: "User not found" })

    res.json(user.savedPosts || [])
  } catch (err) {
    console.error("saved reels error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// ── /:id wildcard routes (MUST be after named routes) ──
router.post("/:id/like",    protect, toggleLike)
router.get("/:id/comments", protect, getComments)
router.post("/:id/comment", protect, addComment)
router.post("/:id/save",    protect, toggleSave)

export default router