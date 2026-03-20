import { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiMoreHorizontal } from "react-icons/fi"
import { FaHeart, FaBookmark } from "react-icons/fa"

export default function Home() {
  const [posts, setPosts] = useState([])
  const [postStates, setPostStates] = useState({})
  const videoRefs = useRef([])

  const userId = localStorage.getItem("userId")
  const me = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get("/posts")
        const data = res.data
        setPosts(data)

        // Initialize like/save state per post
        const states = {}
        data.forEach(p => {
          states[p._id] = {
            liked: p.likes?.includes(userId) || false,
            likeCount: p.likes?.length || 0,
            saved: p.savedBy?.includes(userId) || false,
          }
        })
        setPostStates(states)
      } catch (err) { console.log(err) }
    }
    fetchPosts()
  }, [])

  // Auto play/pause videos on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (entry.isIntersecting) { video.muted = false; video.play().catch(() => {}) }
          else { video.pause(); video.muted = true }
        })
      },
      { threshold: 0.6 }
    )
    videoRefs.current.forEach(v => { if (v) observer.observe(v) })
    return () => { videoRefs.current.forEach(v => { if (v) observer.unobserve(v) }) }
  }, [posts])

  const updatePost = (id, patch) =>
    setPostStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const handleLike = async (id) => {
    try {
      const { data } = await API.post(`/posts/${id}/like`)
      updatePost(id, { liked: data.liked, likeCount: data.likes?.length ?? 0 })
    } catch (err) { console.log(err) }
  }

  const handleSave = async (id) => {
    try {
      const { data } = await API.post(`/posts/${id}/save`)
      updatePost(id, { saved: data.saved })
    } catch (err) { console.log(err) }
  }

  const getAvatar = (user) => {
    if (user?.profilePic && user.profilePic.trim() !== "") return user.profilePic
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=80&bold=true`
  }

  const formatTime = (d) => {
    if (!d) return "Just now"
    const diff = Math.floor((Date.now() - new Date(d)) / 60000)
    if (diff < 1) return "Just now"
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />

      {/* ── Main content area ── */}
      <div className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-xl px-0 sm:px-4 py-0 sm:py-6
          pb-24 md:pb-6">   {/* pb-24 mobile → space for bottom Navbar */}

          {/* Feed heading — hidden on mobile to save space */}
          <h2 className="hidden sm:block text-xl font-bold text-gray-900 mb-5 px-4 sm:px-0">
            Feed
          </h2>

          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-300 gap-3 mt-10">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <FiHeart size={28} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No posts yet</p>
              <p className="text-xs text-gray-300">Follow people to see their posts here</p>
            </div>
          )}

          {posts.map((post, index) => {
            const s = postStates[post._id] || {}

            return (
              <div
                key={post._id}
                className="bg-white border-b border-gray-100 sm:rounded-2xl sm:shadow-sm sm:border sm:border-gray-100 sm:mb-5 overflow-hidden"
              >
                {/* ── Post Header ── */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar with gradient ring */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400 p-0.5 flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden">
                        <img
                          src={getAvatar(post.user)}
                          onError={e => { e.target.src = getAvatar(null) }}
                          className="w-full h-full object-cover"
                          alt={post.user?.username}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{post.user?.username}</p>
                      <p className="text-xs text-gray-400">{formatTime(post.createdAt)}</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-500">
                    <FiMoreHorizontal size={20} />
                  </button>
                </div>

                {/* ── Media ── */}
                <div className="relative bg-black">
                  {post.mediaType === "reel" || post.media?.endsWith(".mp4") || post.media?.includes("video") ? (
                    <video
                      ref={el => videoRefs.current[index] = el}
                      src={post.media}
                      className="w-full aspect-square object-cover"
                      loop muted playsInline
                    />
                  ) : (
                    <img
                      src={post.media}
                      className="w-full aspect-square object-cover"
                      alt={post.caption || "post"}
                      loading="lazy"
                    />
                  )}
                </div>

                {/* ── Action Bar ── */}
                <div className="px-4 pt-3 pb-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">

                      {/* Like */}
                      <button
                        onClick={() => handleLike(post._id)}
                        className="flex items-center gap-1.5 group"
                      >
                        {s.liked
                          ? <FaHeart className="text-red-500 w-6 h-6 group-active:scale-90 transition" />
                          : <FiHeart className="text-gray-700 w-6 h-6 group-hover:text-red-400 group-active:scale-90 transition" />
                        }
                      </button>

                      {/* Comment */}
                      <button className="group">
                        <FiMessageCircle className="text-gray-700 w-6 h-6 group-hover:text-indigo-500 group-active:scale-90 transition" />
                      </button>

                      {/* Share */}
                      <button className="group">
                        <FiSend className="text-gray-700 w-6 h-6 group-hover:text-indigo-500 group-active:scale-90 transition" />
                      </button>
                    </div>

                    {/* Save */}
                    <button
                      onClick={() => handleSave(post._id)}
                      className="group"
                    >
                      {s.saved
                        ? <FaBookmark className="text-indigo-500 w-5 h-5 group-active:scale-90 transition" />
                        : <FiBookmark className="text-gray-700 w-5 h-5 group-hover:text-indigo-500 group-active:scale-90 transition" />
                      }
                    </button>
                  </div>

                  {/* Like count */}
                  {s.likeCount > 0 && (
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      {s.likeCount} {s.likeCount === 1 ? "like" : "likes"}
                    </p>
                  )}

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-sm text-gray-800 mt-1 leading-snug">
                      <span className="font-bold mr-1">{post.user?.username}</span>
                      {post.caption}
                    </p>
                  )}

                  {/* View comments placeholder */}
                  <p className="text-xs text-gray-400 mt-1.5 mb-3 cursor-pointer hover:text-gray-600 transition">
                    View all comments
                  </p>
                </div>
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}