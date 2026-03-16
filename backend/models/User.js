import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({

username:{
type:String,
required:true,
unique:true
},

email:{
type:String,
required:true,
unique:true
},

password:{
type:String,
required:true
},

bio:{
type:String,
default:""
},

profilePic:{
type:String,
default:"https://i.pravatar.cc/150"
},

followers:[
{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}
],

following:[
{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}
]

},{timestamps:true})

const User = mongoose.model("User",UserSchema)

export default User