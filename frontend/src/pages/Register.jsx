import { useState } from "react"
import API from "../api/axios"
import { useNavigate } from "react-router-dom"

export default function Register(){

const [username,setUsername] = useState("")
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const navigate = useNavigate()

const handleRegister = async()=>{

try{

const res = await API.post("/auth/register",{
username,
email,
password
})

alert(res.data.message)

navigate("/")

}catch(err){

alert("Register failed")

}

}

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm">

<h2 className="text-2xl font-bold text-center mb-6">
Create Account
</h2>

<input
className="w-full border p-3 rounded-md mb-4"
placeholder="Username"
onChange={(e)=>setUsername(e.target.value)}
/>

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
onClick={handleRegister}
className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
>
Register
</button>

</div>

</div>

)
}