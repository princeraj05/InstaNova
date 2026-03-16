import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { Link } from "react-router-dom"

const SERVER_URL = import.meta.env.VITE_SERVER_URL

export default function Profile(){

const [user,setUser] = useState({})
const [posts,setPosts] = useState([])

const userId = localStorage.getItem("userId")

useEffect(()=>{

const fetchProfile = async()=>{

try{
const res = await API.get(`/user/${userId}`)
setUser(res.data)
}catch(err){
console.log(err)
}

}

const fetchPosts = async()=>{

try{
const res = await API.get(`/posts/user/${userId}`)
setPosts(res.data)
}catch(err){
console.log(err)
}

}

if(userId){
fetchProfile()
fetchPosts()
}

},[userId])

return(

<div className="flex">

<Navbar/>

<div className="flex-1 md:ml-64 p-6">

<div className="max-w-4xl mx-auto">

{/* PROFILE HEADER */}

<div className="flex flex-col md:flex-row items-center md:items-start gap-8">

<img
src={
user.profilePic
? `${SERVER_URL}/uploads/${user.profilePic}`
: "https://i.pravatar.cc/150"
}
className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover"
/>

<div>

<h2 className="text-2xl font-semibold mb-2">
{user.username}
</h2>

{/* STATS */}

<div className="flex gap-6 text-sm mb-2">

<p>
<span className="font-semibold">{posts.length}</span> posts
</p>

<p>
<span className="font-semibold">{user.followers?.length || 0}</span> followers
</p>

<p>
<span className="font-semibold">{user.following?.length || 0}</span> following
</p>

</div>

<p className="text-gray-700 mb-3">
{user.bio}
</p>

<Link to="/edit-profile">
<button className="px-4 py-1 border rounded-md hover:bg-gray-100">
Edit Profile
</button>
</Link>

</div>

</div>

<hr className="my-8"/>

<h3 className="font-semibold mb-4">
Posts
</h3>

{/* POSTS GRID */}

<div className="grid grid-cols-3 gap-2 md:gap-4">

{posts.map((post)=>(

post.mediaType === "reel" ? (

<video
key={post._id}
src={`${SERVER_URL}/uploads/${post.media}`}
className="w-full aspect-square object-cover rounded-md"
controls
/>

) : (

<img
key={post._id}
src={`${SERVER_URL}/uploads/${post.media}`}
className="w-full aspect-square object-cover rounded-md"
/>

)

))}

</div>

</div>

</div>

</div>

)
}