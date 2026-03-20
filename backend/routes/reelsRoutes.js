import express from "express"
import {
  getReels, toggleLike, getComments,
  addComment, toggleFollow, toggleSave
} from "../controllers/reelsController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// ✅ Put specific named routes BEFORE /:id wildcard routes
router.get("/", protect, getReels)
router.post("/follow/:id", protect, toggleFollow)  // ← move this UP

router.post("/:id/like",    protect, toggleLike)
router.get("/:id/comments", protect, getComments)
router.post("/:id/comment", protect, addComment)
router.post("/:id/save",    protect, toggleSave)

export default router