import express from "express"
import upload from "../middleware/upload.js"

// controllers
import {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  deleteAccount
} from "../controllers/userController.js"

// 🔥 FIX: correct import + correct name
import { protect } from "../middleware/auth.js"

const router = express.Router()

// 🔥 DELETE ACCOUNT FIRST (route conflict avoid)
router.delete("/delete-account", protect, deleteAccount)

// ❤️ FOLLOW / UNFOLLOW
router.put("/follow/:id", protect, followUser)
router.put("/unfollow/:id", protect, unfollowUser)

// ✏️ UPDATE PROFILE
router.put("/:id", protect, upload.single("profilePic"), updateProfile)

// 👤 PROFILE (last me dynamic route)
router.get("/:id", getProfile)

export default router