import Post from "../models/Post.js"
import mongoose from "mongoose"

export const createPost = async (req, res) => {

try {

const { caption, mediaType, userId } = req.body

if (!userId) {
return res.status(400).json({ message: "UserId required" })
}

if (!req.file) {
return res.status(400).json({ message: "Media file required" })
}

const newPost = new Post({

user: new mongoose.Types.ObjectId(userId),
media: req.file.filename,
mediaType: mediaType || "post",
caption

})

await newPost.save()

res.status(201).json({
message: "Post created successfully",
post: newPost
})

} catch (err) {

console.log("Create Post Error:", err)

res.status(500).json({
message: "Server error",
error: err.message
})

}

}



export const getUserPosts = async (req, res) => {

try {

const posts = await Post.find({
user: req.params.id
}).sort({ createdAt: -1 })

res.json(posts)

} catch (err) {

console.log("Get Posts Error:", err)

res.status(500).json({
message: "Server error",
error: err.message
})

}

}
// ============================
// Get All Posts (Home Feed)
// ============================

export const getAllPosts = async (req, res) => {

try {

const posts = await Post.find()
.populate("user","username profilePic")
.sort({createdAt:-1})

res.json(posts)

} catch (err) {

console.log("Get All Posts Error:", err)

res.status(500).json({
message: "Server error",
error: err.message
})

}

}