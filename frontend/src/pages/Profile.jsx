import { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { Link, useNavigate } from "react-router-dom"
import { FiGrid, FiFilm, FiEdit2, FiBookmark, FiPlus } from "react-icons/fi"
import StoryViewer from "../components/StoryViewer"

export default function Profile() {
  const [user, setUser] = useState({})
  const [posts, setPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [tab, setTab] = useState("posts")
  const [uploading, setUploading] = useState(false)

  // 🔥 MY STORIES
  const [myStories, setMyStories] = useState([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [storyIndex, setStoryIndex] = useState(0)

  const storyInputRef = useRef(null)
  const userId = localStorage.getItem("userId")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/user/${userId}`)
        setUser(res.data)
        setSavedPosts(res.data.savedPosts || [])
      } catch (err) { console.log(err) }
    }

    const fetchPosts = async () => {
      try {
        const res = await API.get(`/posts/user/${userId}`)
        setPosts(res.data)
      } catch (err) { console.log(err) }
    }

    const fetchMyStories = async () => {
      try {
        const { data } = await API.get("/stories")
        const mine = data.filter(s =>
          (s.user?._id || s.user || "").toString() === userId?.toString()
        )
        setMyStories(mine)
      } catch (err) { console.log(err) }
    }

    if (userId) {
      fetchProfile()
      fetchPosts()
      fetchMyStories()
    }
  }, [userId])

  // ================= ADD STORY =================
  const handleStoryUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("media", file)

      const { data } = await API.post("/stories", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      setMyStories(prev => [data, ...prev])
      alert("Story uploaded! ✅")
    } catch (err) {
      console.log(err)
      alert("Failed to upload story")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const imgPosts = posts.filter(p => p.mediaType !== "reel")
  const reelPosts = posts.filter(p => p.mediaType === "reel")

  const displayed =
    tab === "posts" ? imgPosts :
    tab === "reels" ? reelPosts :
    savedPosts

  // 🔥 Reel click handler — navigate to /reels?reelId=xxx
  const handleReelClick = (reelId) => {
    navigate(`/reels?reelId=${reelId}`)
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-4xl px-4 py-6 pb-24 md:pb-8">

          {/* Profile header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

              {/* PROFILE PIC + STORY */}
              <div className="relative flex-shrink-0">

                <div
                  onClick={() => {
                    if (myStories.length > 0) {
                      setStoryIndex(0)
                      setViewerOpen(true)
                    }
                  }}
                  className={`w-24 h-24 md:w-28 md:h-28 rounded-full p-[3px] transition
                    ${myStories.length > 0
                      ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 cursor-pointer hover:opacity-90"
                      : "bg-gray-300 cursor-default"
                    }`}
                >
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                    <img
                      src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=120`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>

                {myStories.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {myStories.length}
                  </span>
                )}

                <button
                  onClick={() => storyInputRef.current.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-colors"
                >
                  {uploading ? (
                    <svg className="animate-spin w-3.5 h-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <FiPlus size={14} className="text-white" strokeWidth={3} />
                  )}
                </button>

                <input
                  ref={storyInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleStoryUpload}
                />
              </div>

              {/* User info */}
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
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{posts.length}</p>
                    <p className="text-gray-400 text-xs">posts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{user.followers?.length || 0}</p>
                    <p className="text-gray-400 text-xs">followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{user.following?.length || 0}</p>
                    <p className="text-gray-400 text-xs">following</p>
                  </div>
                </div>

                {user.bio && <p className="text-sm text-gray-600 max-w-sm">{user.bio}</p>}

                <p className="text-xs text-gray-400 mt-1">
                  {myStories.length > 0
                    ? `${myStories.length} active stor${myStories.length > 1 ? "ies" : "y"} · tap photo to view`
                    : "Tap + to add your story"}
                </p>
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
            <button onClick={() => setTab("saved")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition
                ${tab === "saved" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <FiBookmark size={15} /> Saved
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {displayed.map(post => {

              // 🔥 REEL — click karo to navigate to reels page
              if (post.mediaType === "reel") {
                return (
                  <div
                    key={post._id}
                    className="relative rounded-xl overflow-hidden aspect-[9/16] bg-black cursor-pointer group"
                    onClick={() => handleReelClick(post._id)}
                  >
                    <video src={post.media} className="w-full h-full object-cover" />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <FiFilm size={18} className="text-white" />
                      </div>
                    </div>

                    {/* Always visible play icon */}
                    <div className="absolute top-2 right-2">
                      <FiFilm size={14} className="text-white drop-shadow" />
                    </div>
                  </div>
                )
              }

              // 🔥 IMAGE POST
              return (
                <div key={post._id} className="rounded-xl overflow-hidden aspect-square bg-gray-100">
                  <img
                    src={post.media}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              )
            })}
          </div>

          {displayed.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No {tab} yet</p>
            </div>
          )}

        </div>
      </div>

      {/* STORY VIEWER */}
      {viewerOpen && myStories.length > 0 && (
        <StoryViewer
          stories={myStories}
          currentIndex={storyIndex}
          setIndex={setStoryIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  )
}