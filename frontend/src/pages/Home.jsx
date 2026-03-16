import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"

export default function Home(){

const [posts,setPosts] = useState([])

useEffect(()=>{

const fetchPosts = async()=>{

try{

const res = await API.get("/posts")
setPosts(res.data)

}catch(err){
console.log(err)
}

}

fetchPosts()

},[])

return(

<div className="flex bg-gray-100 min-h-screen">

<Navbar/>

<div className="w-full md:ml-64 flex justify-center">

<div className="w-full max-w-xl p-4">

<h2 className="text-xl font-bold mb-6">
Feed
</h2>

{posts.map((post)=>(

<div
key={post._id}
className="bg-white rounded-xl shadow mb-6 overflow-hidden"
>

<div className="p-3 font-semibold border-b">
{post.user?.username}
</div>

{post.mediaType === "reel" ? (

<video
src={`http://localhost:5000/uploads/${post.media}`}
className="w-full"
controls
/>

) : (

<img
src={`http://localhost:5000/uploads/${post.media}`}
className="w-full"
/>

)}

<div className="p-3 text-sm">
{post.caption}
</div>

</div>

))}

</div>

</div>

</div>

)
}