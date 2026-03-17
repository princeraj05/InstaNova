import { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiVolume2, FiVolumeX } from "react-icons/fi"

export default function Reels() {
  const [reels, setReels] = useState([])
  const [muted, setMuted] = useState(false)
  const [userCache, setUserCache] = useState({}) // cache userId -> user object
  const videoRefs = useRef([])

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await API.get("/reels")
        const reelsData = res.data
        setReels(reelsData)

        // ✅ For any reel where user.profilePic is missing, fetch user separately
        const missingUserIds = [
          ...new Set(
            reelsData
              .filter(r => r.user && !r.user.profilePic && r.user._id)
              .map(r => r.user._id)
          )
        ]

        if (missingUserIds.length > 0) {
          const fetched = {}
          await Promise.all(
            missingUserIds.map(async (uid) => {
              try {
                const u = await API.get(`/user/${uid}`)
                fetched[uid] = u.data
              } catch { /* ignore */ }
            })
          )
          setUserCache(fetched)
        }
      } catch (err) { console.log(err) }
    }
    fetchReels()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const video = entry.target
          if (entry.isIntersecting) video.play()
          else video.pause()
        })
      },
      { threshold: 0.7 }
    )
    videoRefs.current.forEach(v => { if (v) observer.observe(v) })
    return () => { videoRefs.current.forEach(v => { if (v) observer.unobserve(v) }) }
  }, [reels])

  // ✅ Get full user: merge reel.user with cached data if profilePic missing
  const getUser = (reel) => {
    const base = reel.user || {}
    const cached = userCache[base._id] || {}
    return { ...base, ...cached }
  }

  // ✅ Avatar helper
  const getAvatar = (user) => {
    if (user?.profilePic && user.profilePic.trim() !== "" && !user.profilePic.includes("pravatar")) {
      return user.profilePic
    }
    if (user?.profilePic && user.profilePic.includes("pravatar")) {
      return user.profilePic // default from model is fine too
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=80`
  }

  // Shared user info section (reused in both mobile & desktop)
  const UserInfo = ({ reel, className = "" }) => {
    const user = getUser(reel)
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-1.5">
          <img
            src={getAvatar(user)}
            className="w-9 h-9 rounded-full object-cover border-2 border-white flex-shrink-0"
            alt={user?.username}
            onError={e => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=80`
            }}
          />
          <p className="text-white text-sm font-semibold drop-shadow">{user?.username}</p>
          <button className="ml-1 px-3 py-0.5 border border-white/70 text-white text-xs rounded-full hover:bg-white/20 transition">
            Follow
          </button>
        </div>
        {reel.caption && (
          <p className="text-white/90 text-sm leading-snug line-clamp-2 drop-shadow">{reel.caption}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex bg-black min-h-screen">
      <Navbar />

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

            {/* ── MOBILE: fullscreen ── */}
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
                <button className="flex flex-col items-center gap-0.5 text-white"><FiHeart size={26} /><span className="text-[11px]">Like</span></button>
                <button className="flex flex-col items-center gap-0.5 text-white"><FiMessageCircle size={26} /><span className="text-[11px]">Comment</span></button>
                <button className="flex flex-col items-center gap-0.5 text-white"><FiSend size={26} /><span className="text-[11px]">Share</span></button>
                <button onClick={() => setMuted(!muted)} className="text-white">
                  {muted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />}
                </button>
              </div>
            </div>

            {/* ── DESKTOP: 9:16 centered ── */}
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
                {[
                  { icon: <FiHeart size={20} />, label: "Like" },
                  { icon: <FiMessageCircle size={20} />, label: "Comment" },
                  { icon: <FiSend size={20} />, label: "Share" },
                  { icon: <FiBookmark size={20} />, label: "Save" },
                ].map(({ icon, label }) => (
                  <button key={label} className="flex flex-col items-center gap-1 text-white hover:text-indigo-300 transition">
                    <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">{icon}</div>
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