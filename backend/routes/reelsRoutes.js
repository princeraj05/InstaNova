import express from "express"
import {
  getReels, toggleLike, getComments,
  addComment, toggleFollow, toggleSave
} from "../controllers/reelsController.js"
import { protect } from "../middleware/auth.js" // your existing auth middleware

const router = express.Router()

router.get("/",            protect, getReels)
router.post("/:id/like",   protect, toggleLike)
router.get("/:id/comments",protect, getComments)
router.post("/:id/comment",protect, addComment)
router.post("/follow/:id", protect, toggleFollow)
router.post("/:id/save",   protect, toggleSave)

export default router