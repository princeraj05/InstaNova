import Post from "../models/Post.js"

export const getReels = async (req, res) => {
  try {
    const reels = await Post.find({ mediaType: "reel" })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })

    res.json(reels)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error fetching reels" })
  }
}