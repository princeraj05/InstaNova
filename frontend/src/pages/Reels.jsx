import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom" // 🔥 UPDATED
import Navbar from "../components/Navbar"
import API from "../api/axios"
import {
  FiHeart, FiMessageCircle, FiSend,
  FiBookmark, FiVolume2, FiVolumeX, FiX
} from "react-icons/fi"
import { FaHeart, FaBookmark } from "react-icons/fa"

export default function Reels() {
  const [reels, setReels]         = useState([])
  const [muted, setMuted]         = useState(false)
  const [userCache, setUserCache] = useState({})
  const [reelStates, setReelStates] = useState({})
  const [commentPanel, setCommentPanel] = useState(null)
  const [comments, setComments]   = useState({})
  const [commentInput, setCommentInput] = useState("")
  const videoRefs = useRef([])
  const navigate  = useNavigate()

  // 🔥 ADD START
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const reelId = query.get("reelId")
  // 🔥 ADD END

  // ── fetch reels ──────────────────────────────────────────
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await API.get("/reels")
        const data = res.data
        setReels(data)

        const me = JSON.parse(localStorage.getItem("user") || "{}")
        const states = {}
        data.forEach(r => {
          states[r._id] = {
            liked:     r.likes?.includes(me._id) || false,
            likeCount: r.likes?.length || 0,
            saved:     false,
            following: false,
          }
        })
        setReelStates(states)

        const missing = [...new Set(
          data.filter(r => r.user && !r.user.profilePic && r.user._id).map(r => r.user._id)
        )]
        if (missing.length) {
          const fetched = {}
          await Promise.all(missing.map(async uid => {
            try { const u = await API.get(`/user/${uid}`); fetched[uid] = u.data } catch {}
          }))
          setUserCache(fetched)
        }
      } catch (err) { console.log(err) }
    }
    fetchReels()
  }, [])

  // 🔥 ADD START (AUTO SCROLL)
  useEffect(() => {
    if (reelId && reels.length > 0) {
      const index = reels.findIndex(r => r._id === reelId)

      if (index !== -1) {
        setTimeout(() => {
          videoRefs.current[index]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          })
        }, 300)
      }
    }
  }, [reels, reelId])
  // 🔥 ADD END

  // ── intersection observer ────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting ? e.target.play() : e.target.pause()),
      { threshold: 0.7 }
    )
    videoRefs.current.forEach(v => v && observer.observe(v))
    return () => videoRefs.current.forEach(v => v && observer.unobserve(v))
  }, [reels])

  const getUser = reel => ({ ...(reel.user || {}), ...(userCache[reel.user?._id] || {}) })

  const getAvatar = user => {
    if (user?.profilePic && user.profilePic.trim() && !user.profilePic.includes("pravatar"))
      return user.profilePic
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=80`
  }

  const updateReel = (id, patch) =>
    setReelStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const handleLike = async (reelId) => {
    try {
      const { data } = await API.post(`/reels/${reelId}/like`)
      updateReel(reelId, { liked: data.liked, likeCount: data.likes.length })
    } catch (err) { console.log(err) }
  }

  const handleFollow = async (userId, reelId) => {
    try {
      const { data } = await API.post(`/reels/follow/${userId}`)
      updateReel(reelId, { following: data.following })
    } catch (err) { console.log(err) }
  }

  const handleSave = async (reelId) => {
    try {
      const { data } = await API.post(`/reels/${reelId}/save`)
      updateReel(reelId, { saved: data.saved })
    } catch (err) { console.log(err) }
  }

  const openComments = async (reelId) => {
    setCommentPanel(reelId)
    if (!comments[reelId]) {
      try {
        const { data } = await API.get(`/reels/${reelId}/comments`)
        setComments(prev => ({ ...prev, [reelId]: data }))
      } catch (err) { console.log(err) }
    }
  }

  const submitComment = async (reelId) => {
    if (!commentInput.trim()) return
    try {
      const { data } = await API.post(`/reels/${reelId}/comment`, { text: commentInput })
      setComments(prev => ({ ...prev, [reelId]: [data, ...(prev[reelId] || [])] }))
      setCommentInput("")
    } catch (err) { console.log(err) }
  }

  const handleShare = (reel) => {
    navigate("/messages", { state: { shareReel: reel } })
  }

  const getActions = (reel) => {
    const s = reelStates[reel._id] || {}
    return [
      { icon: s.liked ? <FaHeart size={22} className="text-red-500" /> : <FiHeart size={22} />, label: s.likeCount || "Like", onClick: () => handleLike(reel._id) },
      { icon: <FiMessageCircle size={22} />, label: "Comment", onClick: () => openComments(reel._id) },
      { icon: <FiSend size={22} />, label: "Share", onClick: () => handleShare(reel) },
      { icon: s.saved ? <FaBookmark size={22} className="text-yellow-400" /> : <FiBookmark size={22} />, label: "Save", onClick: () => handleSave(reel._id) },
    ]
  }

  const UserInfo = ({ reel, className = "" }) => {
    const user = getUser(reel)
    const s = reelStates[reel._id] || {}
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-1.5">
          <img src={getAvatar(user)} className="w-9 h-9 rounded-full cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)} />
          <p className="text-white text-sm font-semibold cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
            {user?.username}
          </p>
          <button onClick={() => handleFollow(user._id, reel._id)}>
            {s.following ? "Following" : "Follow"}
          </button>
        </div>
        {reel.caption && <p className="text-white/90 text-sm">{reel.caption}</p>}
      </div>
    )
  }

  return (
    <div className="flex bg-black min-h-screen">
      <Navbar />

      <div className="md:ml-64 flex-1 overflow-y-scroll snap-y snap-mandatory" style={{ height: "100dvh" }}>
        {reels.map((reel, index) => (
          <div key={reel._id} className="snap-start flex items-center justify-center" style={{ height: "100dvh" }}>

            <div className="relative w-full h-full">
              <video
                ref={el => videoRefs.current[index] = el}
                src={reel.media}
                className="w-full h-full object-cover"
                loop muted={muted} playsInline
              />

              <div className="absolute right-3 bottom-20 flex flex-col gap-5">
                {getActions(reel).map(({ icon, onClick }, i) => (
                  <button key={i} onClick={onClick} className="text-white">{icon}</button>
                ))}
                <button onClick={() => setMuted(!muted)} className="text-white">
                  {muted ? <FiVolumeX /> : <FiVolume2 />}
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}