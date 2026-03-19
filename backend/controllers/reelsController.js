import Post from "../models/Post.js"
import User from "../models/User.js"
import Comment from "../models/Comment.js"
import Notification from "../models/Notification.js"

// GET all reels
export const getReels = async (req, res) => {
  try {
    const reels = await Post.find({ mediaType: "reel" })
      .populate("user", "username profilePic followers")
      .sort({ createdAt: -1 })
    res.json(reels)
  } catch (err) {
    res.status(500).json({ message: "Error fetching reels" })
  }
}

// POST like / unlike a reel
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params          // post id
    const userId = req.user._id        // from auth middleware
    const post = await Post.findById(id)
    if (!post) return res.status(404).json({ message: "Post not found" })

    const liked = post.likes.includes(userId)
    if (liked) {
      post.likes = post.likes.filter(u => u.toString() !== userId.toString())
    } else {
      post.likes.push(userId)
      // send notification if liker != post owner
      if (post.user.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: userId,
          type: "like",
          post: post._id,
          message: "liked your reel"
        })
      }
    }
    await post.save()
    res.json({ likes: post.likes, liked: !liked })
  } catch (err) {
    res.status(500).json({ message: "Error toggling like" })
  }
}

// GET comments for a reel
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })
    res.json(comments)
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments" })
  }
}

// POST a comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body
    const { id } = req.params
    const userId = req.user._id

    const post = await Post.findById(id)
    if (!post) return res.status(404).json({ message: "Post not found" })

    const comment = await Comment.create({ post: id, user: userId, text })
    await comment.populate("user", "username profilePic")

    // send notification
    if (post.user.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "comment",
        post: post._id,
        message: `commented: ${text.slice(0, 40)}`
      })
    }
    res.status(201).json(comment)
  } catch (err) {
    res.status(500).json({ message: "Error adding comment" })
  }
}

// POST follow / unfollow user
export const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id   // user to follow
    const userId = req.user._id

    if (targetId === userId.toString())
      return res.status(400).json({ message: "Cannot follow yourself" })

    const target = await User.findById(targetId)
    const me = await User.findById(userId)
    if (!target || !me) return res.status(404).json({ message: "User not found" })

    const isFollowing = target.followers.includes(userId)
    if (isFollowing) {
      target.followers = target.followers.filter(u => u.toString() !== userId.toString())
      me.following    = me.following.filter(u => u.toString() !== targetId)
    } else {
      target.followers.push(userId)
      me.following.push(targetId)
      await Notification.create({
        recipient: targetId,
        sender: userId,
        type: "follow",
        message: "started following you"
      })
    }
    await Promise.all([target.save(), me.save()])
    res.json({ following: !isFollowing })
  } catch (err) {
    res.status(500).json({ message: "Error toggling follow" })
  }
}

// POST save / unsave a reel
export const toggleSave = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const user = await User.findById(userId)

    const saved = user.savedPosts.includes(id)
    if (saved) {
      user.savedPosts = user.savedPosts.filter(p => p.toString() !== id)
    } else {
      user.savedPosts.push(id)
    }
    await user.save()
    res.json({ saved: !saved })
  } catch (err) {
    res.status(500).json({ message: "Error toggling save" })
  }
}