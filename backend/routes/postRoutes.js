import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"

import { createPost, getUserPosts, getAllPosts } from "../controllers/postController.js"

const router = express.Router()

const uploadPath = "uploads"

// create uploads folder if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath)
}

const storage = multer.diskStorage({

destination: (req, file, cb) => {
cb(null, uploadPath)
},

filename: (req, file, cb) => {

const uniqueName = Date.now() + "-" + file.originalname
cb(null, uniqueName)

}

})

const fileFilter = (req, file, cb) => {

const allowedTypes = [
"image/jpeg",
"image/png",
"image/jpg",
"video/mp4",
"video/mov"
]

if (allowedTypes.includes(file.mimetype)) {
cb(null, true)
} else {
cb(new Error("Only images and videos allowed"), false)
}

}

const upload = multer({
storage,
fileFilter
})

router.post("/create", upload.single("media"), createPost)

router.get("/user/:id", getUserPosts)

router.get("/", getAllPosts)

export default router