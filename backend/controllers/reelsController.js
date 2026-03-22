import Post from "../models/Post.js"
import User from "../models/User.js"
import Comment from "../models/Comment.js"
import Notification from "../models/Notification.js"
import { io } from "../server.js"

// ==============================
// GET REELS
// ==============================
export const getReels = async (req, res) => {
  try {
    const reels = await Post.find({ mediaType: "reel" })
      .populate("user", "username profilePic followers")
      .sort({ createdAt: -1 })

    res.json(reels)
  } catch {
    res.status(500).json({ message: "Error fetching reels" })
  }
}

// ==============================
// LIKE
// ==============================
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const post = await Post.findById(id)
    if (!post) return res.status(404).json({ message: "Post not found" })

    const liked = post.likes.includes(userId)

    if (liked) {
      post.likes = post.likes.filter(u => u.toString() !== userId.toString())
    } else {
      post.likes.push(userId)

      if (post.user.toString() !== userId.toString()) {
        const notif = await Notification.create({
          recipient: post.user,
          sender: userId,
          type: "like",
          post: post._id,
          message: "liked your reel"
        })

        const populatedNotif = await Notification.findById(notif._id)
          .populate("sender", "username profilePic")
          .populate("post", "media")

        io.emit("newNotification", populatedNotif)
      }
    }

    await post.save()
    res.json({ likes: post.likes, liked: !liked })

  } catch {
    res.status(500).json({ message: "Error toggling like" })
  }
}

// ==============================
// GET COMMENTS
// ==============================
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })

    res.json(comments)
  } catch {
    res.status(500).json({ message: "Error fetching comments" })
  }
}

// ==============================
// ADD COMMENT
// ==============================
export const addComment = async (req, res) => {
  try {
    const { text } = req.body
    const { id } = req.params
    const userId = req.user._id

    const post = await Post.findById(id)
    if (!post) return res.status(404).json({ message: "Post not found" })

    const comment = await Comment.create({ post: id, user: userId, text })
    await comment.populate("user", "username profilePic")

    if (post.user.toString() !== userId.toString()) {
      const notif = await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "comment",
        post: post._id,
        message: `commented: ${text.slice(0, 20)}`
      })

      const populatedNotif = await Notification.findById(notif._id)
        .populate("sender", "username profilePic")
        .populate("post", "media")

      io.emit("newNotification", populatedNotif)
    }

    res.status(201).json(comment)

  } catch {
    res.status(500).json({ message: "Error adding comment" })
  }
}

// ==============================
// FOLLOW
// ==============================
export const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id
    const userId = req.user._id

    const target = await User.findById(targetId)
    const me = await User.findById(userId)

    const isFollowing = target.followers.includes(userId)

    if (isFollowing) {
      target.followers = target.followers.filter(u => u.toString() !== userId.toString())
      me.following = me.following.filter(u => u.toString() !== targetId)
    } else {
      target.followers.push(userId)
      me.following.push(targetId)

      const notif = await Notification.create({
        recipient: targetId,
        sender: userId,
        type: "follow",
        message: "started following you"
      })

      const populatedNotif = await Notification.findById(notif._id)
        .populate("sender", "username profilePic")

      io.emit("newNotification", populatedNotif)
    }

    await Promise.all([target.save(), me.save()])
    res.json({ following: !isFollowing })

  } catch {
    res.status(500).json({ message: "Error toggling follow" })
  }
}

// ==============================
// SAVE  ← FIXED
// Saves reel ID into User.savedPosts array
// (same array posts use karte hain — unified saved list)
// ==============================
export const toggleSave = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    // Check if this reel/post id is already saved
    const alreadySaved = user.savedPosts.some(p => p.toString() === id.toString())

    if (alreadySaved) {
      user.savedPosts = user.savedPosts.filter(p => p.toString() !== id.toString())
    } else {
      user.savedPosts.push(id)
    }

    await user.save()
    res.json({ saved: !alreadySaved })

  } catch (err) {
    console.error("toggleSave error:", err)
    res.status(500).json({ message: "Error toggling save" })
  }
}