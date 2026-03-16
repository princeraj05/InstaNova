import { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"

export default function Reels(){

const [reels,setReels] = useState([])
const videoRefs = useRef([])

useEffect(()=>{

const fetchReels = async()=>{

try{
const res = await API.get("/reels")
setReels(res.data)
}catch(err){
console.log(err)
}

}

fetchReels()

},[])



useEffect(()=>{

const observer = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

const video = entry.target

if(entry.isIntersecting){
video.play()
}else{
video.pause()
}

})

},

{
threshold:0.8
}

)

videoRefs.current.forEach(video=>{
if(video) observer.observe(video)
})

return ()=>{
videoRefs.current.forEach(video=>{
if(video) observer.unobserve(video)
})
}

},[reels])



return(

<div className="flex">

<Navbar/>

<div className="flex-1 md:ml-64 bg-black h-screen overflow-y-scroll snap-y snap-mandatory">

{reels.map((reel,index)=>(

<div
key={reel._id}
className="h-screen flex justify-center items-center snap-start"
>

<video
ref={el => videoRefs.current[index] = el}
src={`http://localhost:5000/uploads/${reel.media}`}
className="h-[90vh] w-auto max-w-[420px] object-cover rounded-lg"
loop
controls
/>

</div>

))}

</div>

</div>

)

}
