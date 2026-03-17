import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { Link } from "react-router-dom"

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

    <div className="flex bg-gray-100 min-h-screen">

      <Navbar/>

      <div className="w-full md:ml-64 flex justify-center">

        <div className="w-full max-w-4xl p-4">

          {/* PROFILE HEADER */}

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

            <img
              src={
                user.profilePic
                ? user.profilePic   // ✅ FIXED
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

              <Link to="/edit-profile">
                <button className="mt-3 px-4 py-1 border rounded-md hover:bg-gray-100">
                  Edit Profile
                </button>
              </Link>

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
                  src={post.media}   // ✅ FIXED
                  className="w-full h-40 md:h-56 object-cover rounded-lg"
                  controls
                />

              ) : (

                <img
                  key={post._id}
                  src={post.media}   // ✅ FIXED
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