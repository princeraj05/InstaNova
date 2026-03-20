import { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { FiHeart, FiMessageCircle, FiSend, FiBookmark } from "react-icons/fi"

export default function Home() {
  const [posts, setPosts] = useState([])
  const videoRefs = useRef([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get("/posts")
        setPosts(res.data)
      } catch (err) { console.log(err) }
    }
    fetchPosts()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (entry.isIntersecting) { video.muted = false; video.play() }
          else { video.pause(); video.muted = true }
        })
      },
      { threshold: 0.6 }
    )
    videoRefs.current.forEach(v => { if (v) observer.observe(v) })
    return () => { videoRefs.current.forEach(v => { if (v) observer.unobserve(v) }) }
  }, [posts])

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-xl px-4 py-6 pb-20 md:pb-6">

          <h2 className="text-xl font-bold text-gray-900 mb-5">Feed</h2>

          {posts.map((post, index) => (
            <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5 overflow-hidden">

              {/* Post header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                <img
                  src={post.user?.profilePic || `https://ui-avatars.com/api/?name=${post.user?.username}&background=6366f1&color=fff&size=40`}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{post.user?.username}</p>
                  <p className="text-xs text-gray-400">Just now</p>
                </div>
              </div>

              {/* Media */}
              {post.mediaType === "reel" ? (
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={post.media}
                  className="w-full aspect-square object-cover"
                  loop muted playsInline
                />
              ) : (
                <img src={post.media} className="w-full aspect-square object-cover" />
              )}

              {/* Actions */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <button className="text-gray-700 hover:text-red-500 transition"><FiHeart size={22} /></button>
                    <button className="text-gray-700 hover:text-indigo-500 transition"><FiMessageCircle size={22} /></button>
                    <button className="text-gray-700 hover:text-indigo-500 transition"><FiSend size={22} /></button>
                  </div>
                  <button className="text-gray-700 hover:text-indigo-500 transition"><FiBookmark size={22} /></button>
                </div>
                {post.caption && (
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold mr-1">{post.user?.username}</span>
                    {post.caption}
                  </p>
                )}
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  )
}