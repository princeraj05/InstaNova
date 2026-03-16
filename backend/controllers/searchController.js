import User from "../models/User.js"

// search user by username

export const searchUsers = async (req, res) => {

try {

const keyword = req.query.username || ""

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