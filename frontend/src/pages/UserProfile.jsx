import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { FiArrowLeft, FiGrid, FiFilm, FiUserPlus, FiUserCheck } from "react-icons/fi"

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState({})
  const [posts, setPosts] = useState([])
  const [tab, setTab] = useState("posts")
  const [followed, setFollowed] = useState(false)
  const currentUserId = localStorage.getItem("userId")

  useEffect(() => {
    const fetchUser = async () => {
      try { const res = await API.get(`/user/${id}`); setUser(res.data) }
      catch (err) { console.log(err) }
    }
    const fetchPosts = async () => {
      try { const res = await API.get(`/posts/user/${id}`); setPosts(res.data) }
      catch (err) { console.log(err) }
    }
    if (id) { fetchUser(); fetchPosts() }
  }, [id])

  const handleFollow = async () => {
    try {
      await API.put(`/user/follow/${id}`, { currentUserId })
      setFollowed(!followed)
    } catch { alert("Follow failed") }
  }

  const imgPosts = posts.filter(p => p.mediaType !== "reel")
  const reelPosts = posts.filter(p => p.mediaType === "reel")
  const displayed = tab === "posts" ? imgPosts : reelPosts

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-4xl px-4 py-6 pb-24 md:pb-8">

          {/* Back */}
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition">
            <FiArrowLeft size={16} /> Back
          </button>

          {/* Profile header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <img
                src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=120`}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                  {currentUserId !== id && (
                    <button onClick={handleFollow}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition
                        ${followed
                          ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm hover:opacity-90"}`}>
                      {followed ? <><FiUserCheck size={14} /> Following</> : <><FiUserPlus size={14} /> Follow</>}
                    </button>
                  )}
                </div>
                <div className="flex justify-center sm:justify-start gap-6 text-sm mb-3">
                  <div className="text-center"><p className="font-bold text-gray-900">{posts.length}</p><p className="text-gray-400 text-xs">posts</p></div>
                  <div className="text-center"><p className="font-bold text-gray-900">{user.followers?.length || 0}</p><p className="text-gray-400 text-xs">followers</p></div>
                  <div className="text-center"><p className="font-bold text-gray-900">{user.following?.length || 0}</p><p className="text-gray-400 text-xs">following</p></div>
                </div>
                {user.bio && <p className="text-sm text-gray-600 max-w-sm">{user.bio}</p>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button onClick={() => setTab("posts")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition
                ${tab === "posts" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <FiGrid size={15} /> Posts
            </button>
            <button onClick={() => setTab("reels")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition
                ${tab === "reels" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <FiFilm size={15} /> Reels
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {displayed.map(post => (
              post.mediaType === "reel" ? (
                <div key={post._id} className="relative rounded-xl overflow-hidden aspect-[9/16] bg-black">
                  <video src={post.media} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <FiFilm size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div key={post._id} className="rounded-xl overflow-hidden aspect-square bg-gray-100">
                  <img src={post.media} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                </div>
              )
            ))}
          </div>

          {displayed.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No {tab} yet</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}