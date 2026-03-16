import { useState } from "react"
import API from "../api/axios"
import Navbar from "../components/Navbar"

export default function CreatePost(){

const [media,setMedia] = useState(null)
const [caption,setCaption] = useState("")
const [type,setType] = useState("post")

const userId = localStorage.getItem("userId")

const handleUpload = async ()=>{

if(!media){
alert("Please select file")
return
}

const formData = new FormData()

formData.append("media",media)
formData.append("caption",caption)
formData.append("mediaType",type)
formData.append("userId",userId)

try{

await API.post("/posts/create",formData,{
headers:{
"Content-Type":"multipart/form-data"
}
})

alert("Uploaded successfully")

setMedia(null)
setCaption("")
setType("post")

}catch(err){

console.log(err)
alert("Upload failed")

}

}

return(

<div className="flex min-h-screen bg-gray-100">

<Navbar/>

<div className="w-full md:ml-64 flex justify-center">

<div className="bg-white shadow-lg rounded-xl p-8 mt-10 w-full max-w-md">

<h2 className="text-2xl font-bold mb-6">
Create Post
</h2>

<select
value={type}
onChange={(e)=>setType(e.target.value)}
className="w-full border p-3 rounded-md mb-4"
>

<option value="post">Post (Image)</option>
<option value="reel">Reel (Video)</option>

</select>

<input
type="file"
accept="image/*,video/*"
onChange={(e)=>setMedia(e.target.files[0])}
className="w-full border p-3 rounded-md mb-4"
/>

<input
placeholder="Caption"
value={caption}
onChange={(e)=>setCaption(e.target.value)}
className="w-full border p-3 rounded-md mb-4"
/>

<button
onClick={handleUpload}
className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
>
Upload
</button>

</div>

</div>

</div>

)
}