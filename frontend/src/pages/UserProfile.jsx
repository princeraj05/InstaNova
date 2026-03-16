import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"

const SERVER_URL = import.meta.env.VITE_SERVER_URL

export default function UserProfile(){

const { id } = useParams()

const [user,setUser] = useState({})
const [posts,setPosts] = useState([])

useEffect(()=>{

const fetchUser = async()=>{

try{
const res = await API.get(`/user/${id}`)
setUser(res.data)
}catch(err){
console.log(err)
}

}

const fetchPosts = async()=>{

try{
const res = await API.get(`/posts/user/${id}`)
setPosts(res.data)
}catch(err){
console.log(err)
}

}

if(id){
fetchUser()
fetchPosts()
}

},[id])

return(

<div className="flex bg-gray-100 min-h-screen">

<Navbar/>

<div className="w-full md:ml-64 flex justify-center">

<div className="w-full max-w-4xl p-4">

{/* PROFILE HEADER */}

<div className="flex flex-col md:flex-row items-center md:items-start gap-6">

<img
src={
user.profilePic
? `${SERVER_URL}/uploads/${user.profilePic}`
: "https://i.pravatar.cc/150"
}
className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border"
/>

<div className="text-center md:text-left">

<h2 className="text-2xl font-bold">
{user.username}
</h2>

<div className="flex justify-center md:justify-start gap-6 mt-3 text-sm md:text-base">

<p><b>{posts.length}</b> posts</p>
<p><b>{user.followers?.length || 0}</b> followers</p>
<p><b>{user.following?.length || 0}</b> following</p>

</div>

<p className="mt-3 text-gray-600 max-w-md">
{user.bio}
</p>

</div>

</div>

<hr className="my-8"/>

{/* POSTS GRID */}

<h3 className="text-lg font-semibold mb-4">
Posts
</h3>

<div className="grid grid-cols-2 md:grid-cols-3 gap-3">

{posts.map((post)=>(

post.mediaType === "reel" ? (

<video
key={post._id}
src={`${SERVER_URL}/uploads/${post.media}`}
className="w-full h-40 md:h-56 object-cover rounded-lg"
controls
/>

) : (

<img
key={post._id}
src={`${SERVER_URL}/uploads/${post.media}`}
className="w-full h-40 md:h-56 object-cover rounded-lg"
/>

)

))}

</div>

</div>

</div>

</div>

)
}