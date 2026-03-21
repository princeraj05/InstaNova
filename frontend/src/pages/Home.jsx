import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom" // ✅ ADD
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { io } from "socket.io-client"
import StoryBar from "../components/StoryBar"

import {
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiBookmark,
  FiBell // ✅ ADD
} from "react-icons/fi"
import { FaHeart, FaBookmark } from "react-icons/fa"

// 🔥 SOCKET
const socket = io(import.meta.env.VITE_SERVER_URL)

export default function Home() {

  const [posts, setPosts] = useState([])
  const [postStates, setPostStates] = useState({})
  const [commentPanel, setCommentPanel] = useState(null)
  const [comments, setComments] = useState({})
  const [commentInput, setCommentInput] = useState("")
  const [notifications, setNotifications] = useState([])

  const videoRefs = useRef([])
  const navigate = useNavigate() // ✅ ADD

  const me = JSON.parse(localStorage.getItem("user") || "{}")

  // ================= FETCH POSTS =================
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get("/posts")
        setPosts(res.data)
      } catch (err) { console.log(err) }
    }
    fetchPosts()
  }, [])

  // ================= FETCH NOTIFICATIONS =================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get("/notifications")
        setNotifications(data)
      } catch (err) { console.log(err) }
    }
    fetchNotifications()
  }, [])

  // ================= SOCKET =================
  useEffect(() => {
    if (me?._id) {
      socket.emit("addUser", me._id)
    }

    socket.on("newNotification", (notif) => {
      setNotifications(prev => [notif, ...prev])
    })

    return () => {
      socket.off("newNotification")
    }
  }, [])

  // ================= INITIAL STATE =================
  useEffect(() => {
    const states = {}
    posts.forEach(p => {
      states[p._id] = {
        liked: p.likes?.includes(me._id),
        likeCount: p.likes?.length || 0,
        saved: p.savedBy?.includes(me._id) || false
      }
    })
    setPostStates(states)
  }, [posts])

  // ================= VIDEO AUTO PLAY =================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (entry.isIntersecting) video.play()
          else video.pause()
        })
      },
      { threshold: 0.6 }
    )

    videoRefs.current.forEach(v => v && observer.observe(v))
    return () => observer.disconnect()
  }, [posts])

  // ================= LIKE =================
  const handleLike = async (id) => {
    try {
      const { data } = await API.post(`/posts/${id}/like`, {
        userId: me._id
      })

      setPostStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          liked: data.liked,
          likeCount: data.likes.length
        }
      }))
    } catch (err) { console.log(err) }
  }

  // ================= SAVE =================
  const handleSave = async (id) => {
    try {
      const { data } = await API.post(`/posts/${id}/save`, {
        userId: me._id
      })

      setPostStates(prev => ({
        ...prev,
        [id]: { ...prev[id], saved: data.saved }
      }))
    } catch (err) { console.log(err) }
  }

  // ================= COMMENTS =================
  const openComments = async (id) => {
    setCommentPanel(id)

    if (!comments[id]) {
      try {
        const { data } = await API.get(`/posts/${id}/comments`)
        setComments(prev => ({ ...prev, [id]: data }))
      } catch (err) { console.log(err) }
    }
  }

  const submitComment = async (id) => {
    if (!commentInput.trim()) return

    try {
      const { data } = await API.post(`/posts/${id}/comment`, {
        text: commentInput,
        userId: me._id
      })

      setComments(prev => ({
        ...prev,
        [id]: [data, ...(prev[id] || [])]
      }))

      setCommentInput("")
    } catch (err) { console.log(err) }
  }

  // ================= UI =================
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />

      {/* ================= FEED ================= */}
      <div className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-xl px-4 py-6 pb-20 md:pb-6">

          {/* 🔥 STORIES */}
          <StoryBar />

          {/* HEADER */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Feed</h2>

            <button
              onClick={() => navigate("/notifications")}
              className="relative"
            >
              <FiBell size={22} />

              {/* 🔴 UNREAD DOT */}
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>

          {posts.map((post, index) => {
            const s = postStates[post._id] || {}

            return (
              <div key={post._id} className="bg-white rounded-2xl shadow-sm border mb-5 overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                  <img
                    src={post.user?.profilePic || `https://ui-avatars.com/api/?name=${post.user?.username}`}
                    className="w-9 h-9 rounded-full"
                  />
                  <p className="text-sm font-semibold">{post.user?.username}</p>
                </div>

                {/* MEDIA */}
                {post.mediaType === "reel" ? (
                  <video
                    ref={el => videoRefs.current[index] = el}
                    src={post.media}
                    className="w-full aspect-square object-cover"
                    loop muted
                  />
                ) : (
                  <img src={post.media} className="w-full aspect-square object-cover" />
                )}

                {/* ACTIONS */}
                <div className="px-4 py-3">
                  <div className="flex justify-between mb-2">

                    <div className="flex gap-4">
                      <button onClick={() => handleLike(post._id)}>
                        {s.liked ? <FaHeart className="text-red-500" /> : <FiHeart />}
                      </button>

                      <button onClick={() => openComments(post._id)}>
                        <FiMessageCircle />
                      </button>

                      <FiSend />
                    </div>

                    <button onClick={() => handleSave(post._id)}>
                      {s.saved ? <FaBookmark className="text-yellow-500" /> : <FiBookmark />}
                    </button>
                  </div>

                  <p className="text-sm font-semibold">{s.likeCount} likes</p>

                  <p className="text-sm">
                    <b>{post.user?.username}</b> {post.caption}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ================= 🔥 NOTIFICATION SIDEBAR ================= */}
      <div className="hidden lg:block w-80 p-4 border-l bg-white">
        <h3 className="font-bold mb-4">Notifications</h3>

        <div className="space-y-3 max-h-[80vh] overflow-y-auto">
          {notifications.map(n => (
            <div key={n._id} className="flex items-center gap-3 text-sm">

              <img
                src={n.sender?.profilePic || `https://ui-avatars.com/api/?name=${n.sender?.username}`}
                className="w-8 h-8 rounded-full"
              />

              <p className="flex-1">
                <b>{n.sender?.username}</b> {n.message}
              </p>

            </div>
          ))}

          {notifications.length === 0 && (
            <p className="text-gray-400 text-sm">No notifications</p>
          )}
        </div>
      </div>

      {/* ================= COMMENT PANEL ================= */}
      {commentPanel && (
        <>
          <div className="fixed inset-0 bg-black/50" onClick={() => setCommentPanel(null)} />

          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white p-4 rounded-t-3xl max-h-[70vh] overflow-y-auto">

            {(comments[commentPanel] || []).map(c => (
              <p key={c._id} className="text-sm mb-2">
                <b>{c.user?.username}</b> {c.text}
              </p>
            ))}

            <div className="flex gap-2 mt-3">
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                className="flex-1 border px-3 py-2 rounded-full"
              />
              <button onClick={() => submitComment(commentPanel)} className="text-blue-500">
                Post
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  )
}