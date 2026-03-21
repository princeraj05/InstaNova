import express from "express"
import upload from "../middleware/upload.js"
import { protect } from "../middleware/auth.js"
import { createStory, getStories } from "../controllers/storyController.js"

const router = express.Router()

router.post("/", protect, upload.single("media"), createStory)
router.get("/", protect, getStories)

export default router