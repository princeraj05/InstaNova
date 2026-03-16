import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"

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

<div style={{display:"flex"}}>

<Navbar/>

<div style={{marginLeft:"250px",padding:"40px"}}>

{/* PROFILE HEADER */}

<div style={{display:"flex",alignItems:"center",gap:"40px"}}>

<img
src={
user.profilePic
? `http://localhost:5000/uploads/${user.profilePic}`
: "https://i.pravatar.cc/150"
}
style={{
width:"120px",
height:"120px",
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div>

<h2>{user.username}</h2>

<div style={{display:"flex",gap:"20px",marginTop:"10px"}}>

<p><b>{posts.length}</b> posts</p>
<p><b>{user.followers?.length || 0}</b> followers</p>
<p><b>{user.following?.length || 0}</b> following</p>

</div>

<p style={{marginTop:"10px"}}>
{user.bio}
</p>

</div>

</div>

<hr style={{margin:"40px 0"}}/>

<h3>Posts</h3>

{/* POSTS GRID */}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:"10px"
}}
>

{posts.map((post)=>(

post.mediaType === "reel" ? (

<video
key={post._id}
src={`http://localhost:5000/uploads/${post.media}`}
style={{
width:"100%",
height:"200px",
objectFit:"cover",
borderRadius:"6px"
}}
controls
/>

) : (

<img
key={post._id}
src={`http://localhost:5000/uploads/${post.media}`}
style={{
width:"100%",
height:"200px",
objectFit:"cover",
borderRadius:"6px"
}}
/>

)

))}

</div>

</div>

</div>

)

}