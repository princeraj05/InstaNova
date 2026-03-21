import express from "express"
import upload from "../middleware/upload.js"

import {
  createPost,
  getUserPosts,
  getAllPosts,
  getSavedPosts,
  toggleLikePost,
  toggleSavePost,
  getPostComments,
  addComment
} from "../controllers/postController.js"

const router = express.Router()

// ✅ CREATE POST
router.post("/create", upload.single("media"), createPost)

// ✅ GET SAVED POSTS — 🔥 /user/:id se pehle hona chahiye (order important!)
router.get("/saved/:userId", getSavedPosts)

// ✅ GET USER POSTS
router.get("/user/:id", getUserPosts)

// ✅ GET ALL POSTS (Feed)
router.get("/", getAllPosts)

// 🔥 LIKE / UNLIKE POST
router.post("/:id/like", toggleLikePost)

// 🔥 SAVE / UNSAVE POST
router.post("/:id/save", toggleSavePost)

// 🔥 GET COMMENTS
router.get("/:id/comments", getPostComments)

// 🔥 ADD COMMENT
router.post("/:id/comment", addComment)

export default router