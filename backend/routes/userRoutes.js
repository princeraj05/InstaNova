import express from "express"
import upload from "../middleware/upload.js"

import {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  deleteAccount
} from "../controllers/userController.js"

import { protect } from "../middleware/auth.js"

const router = express.Router()

// ✅ DELETE FIRST
router.delete("/delete-account", protect, deleteAccount)

router.put("/follow/:id", protect, followUser)
router.put("/unfollow/:id", protect, unfollowUser)

router.put("/:id", protect, upload.single("profilePic"), updateProfile)

router.get("/:id", getProfile)

export default router