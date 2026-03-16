import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export const register = async (req, res) => {

const { username, email, password } = req.body

try {

const userExist = await User.findOne({ username })

if (userExist) {
return res.json({
message: "Username already exists"
})
}

const hashed = await bcrypt.hash(password, 10)

const user = new User({
username,
email,
password: hashed
})

await user.save()

res.json({
message: "User registered"
})

} catch (err) {

res.status(500).json(err)

}

}



export const login = async (req, res) => {

try {

const { email, password } = req.body

const user = await User.findOne({ email })

if (!user) {
return res.json({ message: "User not found" })
}

const valid = await bcrypt.compare(password, user.password)

if (!valid) {
return res.json({ message: "Invalid password" })
}

const token = jwt.sign(
{ id: user._id },
process.env.JWT_SECRET,
{ expiresIn: "7d" }
)

res.json({
message: "Login success",
token,
user
})

} catch (err) {

res.status(500).json(err)

}

}