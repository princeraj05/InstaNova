import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { FiHeart, FiMessageCircle, FiUserPlus, FiBell } from "react-icons/fi"

const socket = io(import.meta.env.VITE_SERVER_URL)

const typeConfig = {
  like: {
    icon: <FiHeart size={14} />,
    bg: "bg-rose-500/20",
    text: "text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-400",
  },
  comment: {
    icon: <FiMessageCircle size={14} />,
    bg: "bg-sky-500/20",
    text: "text-sky-400",
    border: "border-sky-500/20",
    dot: "bg-sky-400",
  },
  follow: {
    icon: <FiUserPlus size={14} />,
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  post: {
    icon: <FiMessageCircle size={14} />,
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    border: "border-violet-500/20",
    dot: "bg-violet-400",
  },
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return Math.floor(hours / 24) + "d ago"
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get("/notifications")
        setNotifications(data)
        await API.patch("/notifications/read")
      } catch (err) {
        console.log(err)
      }
    }
    fetch()
  }, [])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user?._id) socket.emit("addUser", user._id)

    socket.on("newNotification", (notif) => {
      setNotifications(prev => [notif, ...prev])
    })

    return () => {
      socket.off("newNotification")
      socket.disconnect()
    }
  }, [])

  const getAvatar = (user) =>
    user?.profilePic && !user.profilePic.includes("pravatar")
      ? user.profilePic
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=80`

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex bg-[#0a0a0f] min-h-screen">
      <Navbar />

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <FiBell size={16} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-white text-lg font-semibold tracking-tight">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-white/40 text-xs mt-0.5">{unreadCount} unread</p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Empty state */}
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                <FiBell size={24} className="text-white/20" />
              </div>
              <div className="text-center">
                <p className="text-white/50 text-sm font-medium">All caught up</p>
                <p className="text-white/20 text-xs mt-1">No notifications yet</p>
              </div>
            </div>
          )}

          {/* Notification list */}
          <div className="flex flex-col gap-2">
            {notifications.map((n, i) => {
              const config = typeConfig[n.type] || typeConfig.post
              return (
                <div
                  key={n._id}
                  onClick={() => n.post && navigate(`/reels?reelId=${n.post._id}`)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`
                    group relative flex items-center gap-3 sm:gap-4
                    px-3 sm:px-4 py-3 sm:py-3.5 rounded-2xl
                    border transition-all duration-200
                    ${n.post ? "cursor-pointer" : "cursor-default"}
                    ${n.read
                      ? "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10"
                      : "bg-indigo-500/[0.06] border-indigo-500/[0.15] hover:bg-indigo-500/[0.1]"
                    }
                    animate-fade-in
                  `}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full ${config.dot}`} />
                  )}

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getAvatar(n.sender)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/5"
                      alt={n.sender?.username}
                      onError={e => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(n.sender?.username || "U")}&background=6366f1&color=fff&size=80`
                      }}
                    />
                    {/* Type badge */}
                    <div className={`
                      absolute -bottom-1 -right-1 w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full
                      flex items-center justify-center
                      ${config.bg} ${config.text} border border-[#0a0a0f]
                    `}>
                      {config.icon}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 leading-snug line-clamp-2">
                      <span className="font-semibold text-white">{n.sender?.username}</span>
                      {" "}
                      <span>{n.message}</span>
                    </p>
                    <p className="text-white/30 text-xs mt-1">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Post thumbnail */}
                  {n.post?.media && (
                    <img
                      src={n.post.media}
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                      alt="post"
                    />
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* Fade-in keyframes */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease both;
        }
      `}</style>
    </div>
  )
}