import User from "../models/User.js"

// ============================
// Get Profile
// ============================

export const getProfile = async (req, res) => {

try{

const user = await User.findById(req.params.id).select("-password")

res.json(user)

}catch(err){

res.status(500).json(err)

}

}


// ============================
// Update Profile
// ============================
export const updateProfile = async (req,res)=>{

try{

let profilePic = req.body.profilePic

// if new image uploaded
if(req.file){
profilePic = req.file.filename
}

const updatedUser = await User.findByIdAndUpdate(
req.params.id,
{
username:req.body.username,
bio:req.body.bio,
profilePic:profilePic
},
{new:true}
).select("-password")

res.json(updatedUser)

}catch(err){

console.log(err)

res.status(500).json({
message:"Profile update error"
})

}

}


// ============================
// Follow User
// ============================

export const followUser = async (req, res) => {

try{

const currentUser = await User.findById(req.body.currentUserId)

const targetUser = await User.findById(req.params.id)

if(!targetUser.followers.includes(req.body.currentUserId)){

await targetUser.updateOne({
$addToSet: { followers: req.body.currentUserId }
})

await currentUser.updateOne({
$addToSet: { following: req.params.id }
})

res.json({message:"Followed"})

}else{

res.json({message:"Already followed"})

}

}catch(err){

res.status(500).json(err)

}

}


// ============================
// Unfollow User
// ============================

export const unfollowUser = async (req, res) => {

try{

const currentUser = await User.findById(req.body.currentUserId)

const targetUser = await User.findById(req.params.id)

if(targetUser.followers.includes(req.body.currentUserId)){

await targetUser.updateOne({
$pull: { followers: req.body.currentUserId }
})

await currentUser.updateOne({
$pull: { following: req.params.id }
})

res.json({message:"Unfollowed"})

}else{

res.json({message:"Not following"})

}

}catch(err){

res.status(500).json(err)

}

}