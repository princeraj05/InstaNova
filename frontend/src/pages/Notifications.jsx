import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client" // 🔥 ADD
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { FiHeart, FiMessageCircle, FiUserPlus } from "react-icons/fi"

// 🔥 SOCKET INIT
const socket = io(import.meta.env.VITE_SERVER_URL)

const iconMap = {
  like:    <FiHeart className="text-red-400" size={18} />,
  comment: <FiMessageCircle className="text-blue-400" size={18} />,
  follow:  <FiUserPlus className="text-green-400" size={18} />,
  post:    <FiMessageCircle className="text-purple-400" size={18} />, // 🔥 NEW TYPE
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  // =========================
  // 🔥 FETCH + MARK READ
  // =========================
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

  // =========================
  // 🔥 REALTIME SOCKET
  // =========================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))

    if (user?._id) {
      socket.emit("addUser", user._id)
    }

    socket.on("newNotification", (notif) => {
      setNotifications(prev => [notif, ...prev])
    })

    return () => {
      socket.off("newNotification")
      socket.disconnect()
    }
  }, [])

  // =========================
  // AVATAR
  // =========================
  const getAvatar = (user) =>
    user?.profilePic && !user.profilePic.includes("pravatar")
      ? user.profilePic
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=80`

  return (
    <div className="flex bg-black min-h-screen">
      <Navbar />

      <div className="md:ml-64 flex-1 p-6 max-w-xl">
        <h2 className="text-white text-xl font-bold mb-6">Notifications</h2>

        {notifications.length === 0 && (
          <p className="text-white/40 text-sm">No notifications yet.</p>
        )}

        <div className="space-y-4">
          {notifications.map(n => (
            <div
              key={n._id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                n.read ? "bg-white/5" : "bg-indigo-500/10"
              }`}

              // 🔥 FIX: OPEN SPECIFIC REEL
              onClick={() => n.post && navigate(`/reels?reelId=${n.post._id}`)}
            >
              {/* USER AVATAR */}
              <img
                src={getAvatar(n.sender)}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                alt={n.sender?.username}
                onError={e => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(n.sender?.username || "U")}&background=6366f1&color=fff&size=80`
                }}
              />

              {/* TEXT */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">
                  <span className="font-semibold">
                    {n.sender?.username}
                  </span>{" "}
                  {n.message}
                </p>

                <p className="text-white/30 text-xs mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* ICON */}
              <div className="flex-shrink-0">
                {iconMap[n.type]}
              </div>

              {/* POST PREVIEW */}
              {n.post?.media && (
                <img
                  src={n.post.media}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                  alt="post"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}