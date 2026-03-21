import User from "../models/User.js"
import Post from "../models/Post.js"
import Message from "../models/Message.js"
import cloudinary from "../config/cloudinary.js"

// ============================
// Get Profile
// ============================

export const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("savedPosts")

    res.json(user)

  } catch (err) {
    res.status(500).json(err)
  }
}


// ============================
// Update Profile
// ============================

export const updateProfile = async (req, res) => {
  try {

    let profilePic = req.body.profilePic

    if (req.file) {
      profilePic = req.file.path
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        username: req.body.username,
        bio: req.body.bio,
        profilePic: profilePic
      },
      { new: true }
    ).select("-password")

    res.json(updatedUser)

  } catch (err) {

    console.log(err)

    res.status(500).json({
      message: "Profile update error"
    })

  }
}


// ============================
// Follow User
// ============================

export const followUser = async (req, res) => {
  try {

    const currentUser = await User.findById(req.body.currentUserId)
    const targetUser = await User.findById(req.params.id)

    if (!targetUser.followers.includes(req.body.currentUserId)) {

      await targetUser.updateOne({
        $addToSet: { followers: req.body.currentUserId }
      })

      await currentUser.updateOne({
        $addToSet: { following: req.params.id }
      })

      res.json({ message: "Followed" })

    } else {

      res.json({ message: "Already followed" })

    }

  } catch (err) {
    res.status(500).json(err)
  }
}


// ============================
// Unfollow User
// ============================

export const unfollowUser = async (req, res) => {
  try {

    const currentUser = await User.findById(req.body.currentUserId)
    const targetUser = await User.findById(req.params.id)

    if (targetUser.followers.includes(req.body.currentUserId)) {

      await targetUser.updateOne({
        $pull: { followers: req.body.currentUserId }
      })

      await currentUser.updateOne({
        $pull: { following: req.params.id }
      })

      res.json({ message: "Unfollowed" })

    } else {

      res.json({ message: "Not following" })

    }

  } catch (err) {
    res.status(500).json(err)
  }
}


// ============================
// 🔥 DELETE ACCOUNT (NEW FEATURE)
// ============================

export const deleteAccount = async (req, res) => {
  try {

    const userId = req.user.id

    // 🔥 1. Get all posts
    const posts = await Post.find({ user: userId })

    // 🔥 2. Delete media from cloudinary
    for (let post of posts) {
      if (post.imagePublicId) {
        await cloudinary.uploader.destroy(post.imagePublicId)
      }
      if (post.videoPublicId) {
        await cloudinary.uploader.destroy(post.videoPublicId)
      }
    }

    // 🔥 3. Delete posts
    await Post.deleteMany({ user: userId })

    // 🔥 4. Delete messages
    await Message.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }]
    })

    // 🔥 5. Remove from followers/following
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    )

    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    )

    // 🔥 6. Delete profile pic from cloudinary
    const user = await User.findById(userId)

    if (user?.profilePicPublicId) {
      await cloudinary.uploader.destroy(user.profilePicPublicId)
    }

    // 🔥 7. Delete user
    await User.findByIdAndDelete(userId)

    res.status(200).json({
      message: "Account deleted successfully"
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      message: "Server error"
    })

  }
}