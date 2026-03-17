import { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"

export default function Home(){

  const [posts,setPosts] = useState([])
  const videoRefs = useRef([])

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

  useEffect(()=>{

    const observer = new IntersectionObserver(

      (entries)=>{

        entries.forEach((entry)=>{

          const video = entry.target

          if(entry.isIntersecting){
            video.muted = false
            video.play()
          }else{
            video.pause()
            video.muted = true
          }

        })

      },

      { threshold: 0.6 }

    )

    videoRefs.current.forEach((video)=>{
      if(video) observer.observe(video)
    })

    return ()=>{
      videoRefs.current.forEach((video)=>{
        if(video) observer.unobserve(video)
      })
    }

  },[posts])

  return(

    <div className="flex bg-gray-100 min-h-screen">

      <Navbar/>

      <div className="w-full md:ml-64 flex justify-center">

        <div className="w-full max-w-xl p-4">

          <h2 className="text-xl font-bold mb-6">
            Feed
          </h2>

          {posts.map((post,index)=>(

            <div
              key={post._id}
              className="bg-white rounded-xl shadow mb-6 overflow-hidden"
            >

              <div className="p-3 font-semibold border-b">
                {post.user?.username}
              </div>

              {post.mediaType === "reel" ? (

                <video
                  ref={(el)=>videoRefs.current[index]=el}
                  src={post.media}   // ✅ FIXED
                  className="w-full"
                  loop
                />

              ) : (

                <img
                  src={post.media}   // ✅ FIXED
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