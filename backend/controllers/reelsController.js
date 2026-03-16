import Post from "../models/Post.js"

// get all reels
export const getReels = async (req,res)=>{

try{

const reels = await Post.find({
mediaType:"reel"
}).sort({createdAt:-1})

res.json(reels)

}catch(err){

console.log(err)

res.status(500).json({
message:"Error fetching reels"
})

}

}