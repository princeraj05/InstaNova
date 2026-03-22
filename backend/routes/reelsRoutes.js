import express from "express"
import {
  getReels, toggleLike, getComments,
  addComment, toggleFollow, toggleSave
} from "../controllers/reelsController.js"
import { protect } from "../middleware/auth.js"
import Reel from "../models/Reel.js"

const router = express.Router()

// ✅ Specific named routes BEFORE /:id wildcard routes
router.get("/", protect, getReels)
router.post("/follow/:id", protect, toggleFollow)

// ✅ Saved reels by userId
router.get("/saved/:userId", protect, async (req, res) => {
  try {
    const reels = await Reel.find({ savedBy: req.params.userId }).populate("user", "username profilePic")
    res.json(reels)
  } catch (err) {
    console.error("saved reels error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// /:id wildcard routes (must be AFTER all named routes)
router.post("/:id/like",    protect, toggleLike)
router.get("/:id/comments", protect, getComments)
router.post("/:id/comment", protect, addComment)
router.post("/:id/save",    protect, toggleSave)

export default router