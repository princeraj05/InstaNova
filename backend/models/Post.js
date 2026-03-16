import mongoose from "mongoose"

const postSchema = new mongoose.Schema({

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

media:{
type:String,
required:true
},

mediaType:{
type:String,
enum:["post","reel"],
default:"post"
},

caption:{
type:String
},

likes:[
{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}
],

createdAt:{
type:Date,
default:Date.now
}

})

export default mongoose.model("Post",postSchema)