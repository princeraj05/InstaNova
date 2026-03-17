import express from "express"
import upload from "../middleware/upload.js"

import { createPost, getUserPosts, getAllPosts } from "../controllers/postController.js"

const router = express.Router()

// ✅ CREATE POST (Cloudinary upload)
router.post("/create", upload.single("media"), createPost)

// ✅ GET USER POSTS
router.get("/user/:id", getUserPosts)

// ✅ GET ALL POSTS (Feed)
router.get("/", getAllPosts)

export default router