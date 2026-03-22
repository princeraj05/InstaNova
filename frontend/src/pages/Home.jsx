import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { io } from "socket.io-client"
import StoryBar from "../components/StoryBar"

import {
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiBookmark,
  FiBell,
  FiX
} from "react-icons/fi"
import { FaHeart, FaBookmark } from "react-icons/fa"

const socket = io(import.meta.env.VITE_SERVER_URL)

export default function Home() {

  const [posts, setPosts] = useState([])
  const [postStates, setPostStates] = useState({})
  const [commentPanel, setCommentPanel] = useState(null)
  const [comments, setComments] = useState({})
  const [commentInput, setCommentInput] = useState("")
  const [notifications, setNotifications] = useState([])
  const [showNotifDrawer, setShowNotifDrawer] = useState(false)

  const videoRefs = useRef([])
  const navigate = useNavigate()

  const me = JSON.parse(localStorage.getItem("user") || "{}")
  const myId = (me._id || me.id || localStorage.getItem("userId") || "").toString()

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
    if (myId) socket.emit("addUser", myId)
    socket.on("newNotification", (notif) => {
      setNotifications(prev => [notif, ...prev])
    })
    return () => { socket.off("newNotification") }
  }, [])

  // ================= INITIAL STATE =================
  useEffect(() => {
    const states = {}
    posts.forEach(p => {
      const likes = (p.likes || []).filter(Boolean).map(id => id.toString())
      const savedBy = (p.savedBy || []).filter(Boolean).map(id => id.toString())
      states[p._id] = {
        liked: likes.includes(myId),
        likeCount: p.likes?.length || 0,
        saved: savedBy.includes(myId)
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
      const { data } = await API.post(`/posts/${id}/like`, { userId: myId })
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
      const { data } = await API.post(`/posts/${id}/save`, { userId: myId })
      setPostStates(prev => ({
        ...prev,
        [id]: { ...prev[id], saved: data.saved }
      }))
    } catch (err) { console.log(err) }
  }

  // ================= SHARE =================
  const handleShare = (post) => {
    navigate("/messages", { state: { sharePost: post } })
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
        userId: myId
      })
      setComments(prev => ({
        ...prev,
        [id]: [data, ...(prev[id] || [])]
      }))
      setCommentInput("")
    } catch (err) { console.log(err) }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex bg-gray-50 min-h-screen">

      {/* ── SIDEBAR NAV (hidden on mobile, shown md+) ── */}
      <Navbar />

      {/* ══════════════════════════════════════════
          MAIN FEED COLUMN
      ══════════════════════════════════════════ */}
      <div className="
        flex-1
        md:ml-64
        flex justify-center
        /* On xl screens, shift left slightly so right sidebar doesn't crush feed */
        xl:mr-80
      ">
        <div className="
          w-full
          max-w-xl
          /* mobile: tighter padding + bottom space for bottom nav */
          px-3 py-4 pb-24
          /* tablet+ */
          sm:px-4 sm:py-5
          /* desktop */
          md:pb-8 md:py-6
        ">

          {/* ── TOP BAR (mobile only) ── */}
          <div className="
            flex items-center justify-between mb-4
            md:hidden
          ">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Feed</h1>
            <button
              onClick={() => setShowNotifDrawer(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="
                  absolute top-1 right-1
                  min-w-[16px] h-4 px-[3px]
                  bg-red-500 text-white text-[10px] font-bold
                  rounded-full flex items-center justify-center
                ">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* ── DESKTOP FEED HEADER ── */}
          <div className="hidden md:flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Feed</h2>
            {/* Bell shown only when right sidebar is hidden (md only, not xl) */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative xl:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiBell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>

          {/* ── STORIES ── */}
          <StoryBar />

          {/* ── POSTS ── */}
          {posts.map((post, index) => {
            const s = postStates[post._id] || {}

            return (
              <div
                key={post._id}
                className="
                  bg-white rounded-2xl shadow-sm border mb-4
                  overflow-hidden
                  /* slight hover lift on desktop */
                  transition-shadow duration-200
                  hover:shadow-md
                "
              >
                {/* POST HEADER */}
                <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 border-b">
                  <img
                    src={post.user?.profilePic || `https://ui-avatars.com/api/?name=${post.user?.username}`}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0"
                    alt={post.user?.username}
                  />
                  <p className="text-sm font-semibold truncate">{post.user?.username}</p>
                </div>

                {/* MEDIA */}
                {post.mediaType === "reel" ? (
                  <video
                    ref={el => videoRefs.current[index] = el}
                    src={post.media}
                    className="w-full aspect-square object-cover"
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={post.media}
                    className="w-full aspect-square object-cover"
                    alt="post"
                    loading="lazy"
                  />
                )}

                {/* ACTIONS */}
                <div className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="p-0.5 rounded-full hover:scale-110 transition-transform active:scale-95"
                      >
                        {s.liked
                          ? <FaHeart className="text-red-500 w-5 h-5" />
                          : <FiHeart className="w-5 h-5 text-gray-700" />}
                      </button>
                      <button
                        onClick={() => openComments(post._id)}
                        className="p-0.5 rounded-full hover:scale-110 transition-transform active:scale-95"
                      >
                        <FiMessageCircle className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleShare(post)}
                        className="p-0.5 rounded-full hover:scale-110 transition-transform active:scale-95"
                      >
                        <FiSend className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleSave(post._id)}
                      className="p-0.5 rounded-full hover:scale-110 transition-transform active:scale-95"
                    >
                      {s.saved
                        ? <FaBookmark className="text-yellow-500 w-5 h-5" />
                        : <FiBookmark className="w-5 h-5 text-gray-700" />}
                    </button>
                  </div>

                  <p className="text-sm font-semibold">{s.likeCount} likes</p>
                  <p className="text-sm mt-0.5 leading-snug">
                    <b>{post.user?.username}</b>{" "}
                    <span className="text-gray-700">{post.caption}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT SIDEBAR — notifications
          Only on xl screens
      ══════════════════════════════════════════ */}
      <div className="
        hidden xl:flex
        flex-col
        w-80 shrink-0
        fixed right-0 top-0 bottom-0
        border-l bg-white
        p-5
        overflow-y-auto
      ">
        <h3 className="font-bold text-base mb-4 text-gray-900">Notifications</h3>
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n._id}
              className={`
                flex items-start gap-3 text-sm p-2 rounded-xl transition-colors
                ${!n.read ? "bg-blue-50" : "hover:bg-gray-50"}
              `}
            >
              <img
                src={n.sender?.profilePic || `https://ui-avatars.com/api/?name=${n.sender?.username}`}
                className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
                alt={n.sender?.username}
              />
              <p className="flex-1 leading-snug text-gray-700">
                <b className="text-gray-900">{n.sender?.username}</b>{" "}{n.message}
              </p>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No notifications yet</p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE NOTIFICATION DRAWER
          Slides up from bottom on small screens
      ══════════════════════════════════════════ */}
      {showNotifDrawer && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 xl:hidden"
            onClick={() => setShowNotifDrawer(false)}
          />
          {/* drawer */}
          <div className="
            fixed bottom-0 left-0 right-0 z-50
            bg-white rounded-t-3xl
            max-h-[70vh] overflow-y-auto
            p-5
            xl:hidden
          ">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowNotifDrawer(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {notifications.map(n => (
                <div
                  key={n._id}
                  className={`
                    flex items-start gap-3 text-sm p-2 rounded-xl
                    ${!n.read ? "bg-blue-50" : ""}
                  `}
                >
                  <img
                    src={n.sender?.profilePic || `https://ui-avatars.com/api/?name=${n.sender?.username}`}
                    className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
                    alt={n.sender?.username}
                  />
                  <p className="flex-1 leading-snug text-gray-700">
                    <b className="text-gray-900">{n.sender?.username}</b>{" "}{n.message}
                  </p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">No notifications yet</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          COMMENT PANEL
      ══════════════════════════════════════════ */}
      {commentPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setCommentPanel(null)}
          />
          <div className="
            fixed bottom-0 left-0 right-0 z-50
            md:left-64
            xl:right-80
            bg-white rounded-t-3xl
            max-h-[70vh] flex flex-col
          ">
            {/* drag handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* header */}
            <div className="flex items-center justify-between px-4 pb-2 border-b shrink-0">
              <p className="font-semibold text-sm text-gray-800">Comments</p>
              <button
                onClick={() => setCommentPanel(null)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {(comments[commentPanel] || []).map(c => (
                <div key={c._id} className="flex items-start gap-2">
                  <img
                    src={c.user?.profilePic || `https://ui-avatars.com/api/?name=${c.user?.username}`}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                    alt={c.user?.username}
                  />
                  <p className="text-sm leading-snug">
                    <b>{c.user?.username}</b>{" "}
                    <span className="text-gray-700">{c.text}</span>
                  </p>
                </div>
              ))}
              {(comments[commentPanel] || []).length === 0 && (
                <p className="text-gray-400 text-sm text-center py-6">No comments yet</p>
              )}
            </div>

            {/* input */}
            <div className="flex gap-2 px-4 py-3 border-t shrink-0">
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") submitComment(commentPanel) }}
                placeholder="Add a comment..."
                className="
                  flex-1 border px-3 py-2 rounded-full text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-300
                  bg-gray-50
                "
              />
              <button
                onClick={() => submitComment(commentPanel)}
                className="
                  text-indigo-500 font-semibold text-sm
                  px-2 py-1 rounded-full
                  hover:bg-indigo-50 transition-colors
                  disabled:opacity-40
                "
                disabled={!commentInput.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}