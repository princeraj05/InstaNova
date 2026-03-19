import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
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
  const [reelStates, setReelStates] = useState({}) // per-reel: liked, saved, following, likeCount
  const [commentPanel, setCommentPanel] = useState(null) // reelId or null
  const [comments, setComments]   = useState({})        // reelId -> []
  const [commentInput, setCommentInput] = useState("")
  const videoRefs = useRef([])
  const navigate  = useNavigate()

  // ── fetch reels ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await API.get("/reels")
        const data = res.data
        setReels(data)

        // build initial per-reel state from server data
        const me = JSON.parse(localStorage.getItem("user") || "{}")
        const states = {}
        data.forEach(r => {
          states[r._id] = {
            liked:     r.likes?.includes(me._id) || false,
            likeCount: r.likes?.length || 0,
            saved:     false,   // load from user profile if needed
            following: false,   // will update after fetching current user's following list
          }
        })
        setReelStates(states)

        // fetch missing profilePics
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

  // ── intersection observer for autoplay ───────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting ? e.target.play() : e.target.pause()),
      { threshold: 0.7 }
    )
    videoRefs.current.forEach(v => v && observer.observe(v))
    return () => videoRefs.current.forEach(v => v && observer.unobserve(v))
  }, [reels])

  // ── helpers ──────────────────────────────────────────────────────────────
  const getUser = reel => ({ ...(reel.user || {}), ...(userCache[reel.user?._id] || {}) })

  const getAvatar = user => {
    if (user?.profilePic && user.profilePic.trim() && !user.profilePic.includes("pravatar"))
      return user.profilePic
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=80`
  }

  const updateReel = (id, patch) =>
    setReelStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  // ── actions ──────────────────────────────────────────────────────────────
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
    // Navigate to messages page with reel info pre-filled
    navigate("/messages", { state: { shareReel: reel } })
  }

  // ── action buttons config ─────────────────────────────────────────────
  const getActions = (reel) => {
    const s = reelStates[reel._id] || {}
    return [
      {
        icon: s.liked ? <FaHeart size={22} className="text-red-500" /> : <FiHeart size={22} />,
        label: s.likeCount || "Like",
        onClick: () => handleLike(reel._id)
      },
      {
        icon: <FiMessageCircle size={22} />,
        label: "Comment",
        onClick: () => openComments(reel._id)
      },
      {
        icon: <FiSend size={22} />,
        label: "Share",
        onClick: () => handleShare(reel)
      },
      {
        icon: s.saved ? <FaBookmark size={22} className="text-yellow-400" /> : <FiBookmark size={22} />,
        label: "Save",
        onClick: () => handleSave(reel._id)
      },
    ]
  }

  // ── UserInfo ─────────────────────────────────────────────────────────────
  const UserInfo = ({ reel, className = "" }) => {
    const user = getUser(reel)
    const s    = reelStates[reel._id] || {}
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-1.5">
          {/* clickable avatar → profile */}
          <img
            src={getAvatar(user)}
            className="w-9 h-9 rounded-full object-cover border-2 border-white flex-shrink-0 cursor-pointer"
            alt={user?.username}
            onClick={() => navigate(`/profile/${user._id}`)}
            onError={e => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=80`
            }}
          />
          <p
            className="text-white text-sm font-semibold drop-shadow cursor-pointer hover:underline"
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            {user?.username}
          </p>
          <button
            onClick={() => handleFollow(user._id, reel._id)}
            className={`ml-1 px-3 py-0.5 border text-xs rounded-full transition ${
              s.following
                ? "bg-white text-black border-white"
                : "border-white/70 text-white hover:bg-white/20"
            }`}
          >
            {s.following ? "Following" : "Follow"}
          </button>
        </div>
        {reel.caption && (
          <p className="text-white/90 text-sm leading-snug line-clamp-2 drop-shadow">{reel.caption}</p>
        )}
      </div>
    )
  }

  // ── Comment Panel ────────────────────────────────────────────────────────
  const CommentPanel = ({ reelId }) => {
    if (!reelId) return null
    const list = comments[reelId] || []
    return (
      <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setCommentPanel(null)}>
        <div
          className="w-full max-w-sm bg-[#1a1a1a] h-full flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">Comments</h3>
            <button onClick={() => setCommentPanel(null)} className="text-white/60 hover:text-white">
              <FiX size={20} />
            </button>
          </div>

          {/* comment list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {list.length === 0 && (
              <p className="text-white/40 text-sm text-center mt-8">No comments yet. Be first!</p>
            )}
            {list.map(c => (
              <div key={c._id} className="flex gap-3">
                <img
                  src={getAvatar(c.user)}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                  alt={c.user?.username}
                  onClick={() => { setCommentPanel(null); navigate(`/profile/${c.user?._id}`) }}
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.username || "U")}&background=6366f1&color=fff&size=80` }}
                />
                <div>
                  <span
                    className="text-white text-xs font-semibold cursor-pointer hover:underline mr-2"
                    onClick={() => { setCommentPanel(null); navigate(`/profile/${c.user?._id}`) }}
                  >
                    {c.user?.username}
                  </span>
                  <span className="text-white/80 text-xs">{c.text}</span>
                  <p className="text-white/30 text-[10px] mt-0.5">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* input */}
          <div className="px-4 py-3 border-t border-white/10 flex gap-2">
            <input
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitComment(reelId)}
              placeholder="Add a comment..."
              className="flex-1 bg-white/10 text-white text-sm rounded-full px-4 py-2 outline-none placeholder:text-white/40"
            />
            <button
              onClick={() => submitComment(reelId)}
              className="text-indigo-400 font-semibold text-sm hover:text-indigo-300"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex bg-black min-h-screen">
      <Navbar />
      <CommentPanel reelId={commentPanel} />

      <div
        className="md:ml-64 flex-1 overflow-y-scroll snap-y snap-mandatory"
        style={{ height: "100dvh", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel._id}
            className="snap-start snap-always bg-black flex items-center justify-center"
            style={{ height: "100dvh" }}
          >

            {/* ── MOBILE ── */}
            <div className="relative w-full h-full md:hidden">
              <video
                ref={el => videoRefs.current[index] = el}
                src={reel.media}
                className="absolute inset-0 w-full h-full object-cover"
                loop muted={muted} playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent pointer-events-none" />
              <UserInfo reel={reel} className="absolute bottom-0 left-0 right-14 px-4 pb-24" />
              <div className="absolute right-3 bottom-0 pb-24 flex flex-col items-center gap-5">
                {getActions(reel).map(({ icon, label, onClick }) => (
                  <button key={label} onClick={onClick} className="flex flex-col items-center gap-0.5 text-white">
                    {icon}<span className="text-[11px]">{label}</span>
                  </button>
                ))}
                <button onClick={() => setMuted(!muted)} className="text-white mt-1">
                  {muted ? <FiVolumeX size={22} /> : <FiVolume2 size={22} />}
                </button>
              </div>
            </div>

            {/* ── DESKTOP ── */}
            <div className="hidden md:flex w-full h-full items-center justify-center gap-6">
              <div
                className="relative bg-black rounded-2xl overflow-hidden flex-shrink-0"
                style={{ height: "min(90dvh, 720px)", aspectRatio: "9/16" }}
              >
                <video
                  ref={el => { if (!videoRefs.current[index]) videoRefs.current[index] = el }}
                  src={reel.media}
                  className="w-full h-full object-cover"
                  loop muted={muted} playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <UserInfo reel={reel} className="absolute bottom-4 left-4 right-4" />
                <button
                  onClick={() => setMuted(!muted)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition"
                >
                  {muted ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
                </button>
              </div>

              <div className="flex flex-col items-center gap-6">
                {getActions(reel).map(({ icon, label, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="flex flex-col items-center gap-1 text-white hover:text-indigo-300 transition"
                  >
                    <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                      {icon}
                    </div>
                    <span className="text-xs text-white/70">{label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}