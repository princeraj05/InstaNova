import { useState } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { useNavigate } from "react-router-dom"

const SERVER_URL = import.meta.env.VITE_SERVER_URL

export default function Search(){

const [query,setQuery] = useState("")
const [users,setUsers] = useState([])

const navigate = useNavigate()
const currentUserId = localStorage.getItem("userId")

const handleSearch = async(e)=>{

const value = e.target.value
setQuery(value)

if(value.length > 0){

try{

const res = await API.get(`/search?username=${value}`)
setUsers(res.data || [])

}catch(err){
console.log(err)
setUsers([])
}

}else{
setUsers([])
}

}

const followUser = async(id)=>{

try{

const res = await API.put(`/user/follow/${id}`,{
currentUserId
})

alert(res.data.message || "Success")

// optional: user list update
setUsers(users.filter(u => u._id !== id))

}catch(err){

console.log(err)
alert("Follow failed")

}

}

const openProfile = (id)=>{
navigate(`/user/${id}`)
}

return(

<div className="flex min-h-screen bg-gray-100">

<Navbar/>

<div className="w-full md:ml-64 flex justify-center">

<div className="w-full max-w-md p-6">

<h2 className="text-2xl font-bold mb-6">
Search Users
</h2>

<input
placeholder="Search username..."
value={query}
onChange={handleSearch}
className="w-full border p-3 rounded-lg"
/>

<div className="mt-6 space-y-4">

{users.length === 0 && query.length > 0 && (
<p className="text-gray-500 text-sm">
No users found
</p>
)}

{users.map((user)=>(

<div
key={user._id}
className="flex items-center justify-between bg-white p-3 rounded-lg shadow"
>

<div
onClick={()=>openProfile(user._id)}
className="flex items-center gap-3 cursor-pointer"
>

<img
src={
user.profilePic
? `${SERVER_URL}/uploads/${user.profilePic}`
: "https://i.pravatar.cc/150"
}
className="w-10 h-10 rounded-full object-cover"
/>

<span className="font-medium">
{user.username}
</span>

</div>

<button
onClick={()=>followUser(user._id)}
className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
>
Follow
</button>

</div>

))}

</div>

</div>

</div>

</div>

)
}