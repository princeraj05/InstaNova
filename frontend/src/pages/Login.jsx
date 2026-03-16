import { useState } from "react"
import API from "../api/axios"
import { Link, useNavigate } from "react-router-dom"

export default function Login(){

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const navigate = useNavigate()

const handleLogin = async()=>{

try{

const res = await API.post("/auth/login",{
email,
password
})

alert(res.data.message)

localStorage.setItem("userId",res.data.user._id)
localStorage.setItem("token",res.data.token)

navigate("/home")

}catch(err){

alert("Login failed")

}

}

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm">

<h2 className="text-2xl font-bold text-center mb-6">
Instagram Clone
</h2>

<input
className="w-full border p-3 rounded-md mb-4"
placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
className="w-full border p-3 rounded-md mb-4"
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<button
onClick={handleLogin}
className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
>
Login
</button>

<p className="text-center mt-4 text-sm">
Don't have account? 
<Link className="text-blue-500 ml-1" to="/register">
Register
</Link>
</p>

</div>

</div>

)
}