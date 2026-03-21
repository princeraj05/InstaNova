import express from "express"
import upload from "../middleware/upload.js"

// 🔥 IMPORT ALL CONTROLLERS (including delete)
import {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  deleteAccount   // ✅ NEW
} from "../controllers/userController.js"

import authMiddleware from "../middleware/authMiddleware.js" // ✅ NEW

const router = express.Router()

// 👤 PROFILE
router.get("/:id", getProfile)

// ✏️ UPDATE PROFILE
router.put("/:id", authMiddleware, upload.single("profilePic"), updateProfile)

// ❤️ FOLLOW / UNFOLLOW
router.put("/follow/:id", authMiddleware, followUser)
router.put("/unfollow/:id", authMiddleware, unfollowUser)

// 🔥 DELETE ACCOUNT (MOST IMPORTANT)
router.delete("/delete-account", authMiddleware, deleteAccount)

export default router