import express from "express"
import upload from "../middleware/upload.js"   // ✅ Cloudinary upload

import {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser
} from "../controllers/userController.js"

const router = express.Router()

router.get("/:id", getProfile)

router.put("/:id", upload.single("profilePic"), updateProfile) // ✅ FIXED

router.put("/follow/:id", followUser)
router.put("/unfollow/:id", unfollowUser)

export default router