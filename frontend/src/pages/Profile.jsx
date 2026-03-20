import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { Link } from "react-router-dom"
import { FiGrid, FiFilm, FiEdit2, FiBookmark } from "react-icons/fi"

export default function Profile() {
  const [user, setUser] = useState({})
  const [posts, setPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([]) // 🔥 NEW
  const [tab, setTab] = useState("posts")
  const userId = localStorage.getItem("userId")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/user/${userId}`)
        setUser(res.data)
        setSavedPosts(res.data.savedPosts || []) // 🔥 NEW
      } catch (err) { console.log(err) }
    }

    const fetchPosts = async () => {
      try {
        const res = await API.get(`/posts/user/${userId}`)
        setPosts(res.data)
      } catch (err) { console.log(err) }
    }

    if (userId) {
      fetchProfile()
      fetchPosts()
    }
  }, [userId])

  const imgPosts = posts.filter(p => p.mediaType !== "reel")
  const reelPosts = posts.filter(p => p.mediaType === "reel")

  // 🔥 UPDATED DISPLAY LOGIC
  const displayed =
    tab === "posts" ? imgPosts :
    tab === "reels" ? reelPosts :
    savedPosts

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-4xl px-4 py-6 pb-24 md:pb-8">

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
                  <Link to="/edit-profile">
                    <button className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      <FiEdit2 size={13} /> Edit Profile
                    </button>
                  </Link>
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

            {/* 🔥 NEW SAVED TAB */}
            <button onClick={() => setTab("saved")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition
                ${tab === "saved" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <FiBookmark size={15} /> Saved
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