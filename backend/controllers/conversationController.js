import User from "../models/User.js"

export const searchUsers = async (req, res) => {
  try {

    // 🔥 support both query & username
    const keyword = req.query.query || req.query.username || ""

    const users = await User.find({
      username: {
        $regex: keyword,
        $options: "i"
      }
    })
    .select("-password")
    .limit(10)

    res.json(users)

  } catch (err) {
    res.status(500).json(err)
  }
}