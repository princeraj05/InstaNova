import { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { FiHeart, FiMessageCircle, FiSend, FiVolume2, FiVolumeX } from "react-icons/fi"

export default function Reels() {
  const [reels, setReels] = useState([])
  const [muted, setMuted] = useState(false)
  const videoRefs = useRef([])

  useEffect(() => {
    const fetchReels = async () => {
      try { const res = await API.get("/reels"); setReels(res.data) }
      catch (err) { console.log(err) }
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

  return (
    <div className="flex bg-black min-h-screen">
      <Navbar />

      {/* Scroll container — full height, no overflow outside */}
      <div
        className="md:ml-64 flex-1 overflow-y-scroll snap-y snap-mandatory"
        style={{ height: "100dvh", scrollbarWidth: "none" }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel._id}
            className="relative snap-start snap-always bg-black flex items-center justify-center overflow-hidden"
            style={{ height: "100dvh" }}
          >
            {/* Video fills screen, covers fully on mobile */}
            <video
              ref={el => videoRefs.current[index] = el}
              src={reel.media}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              muted={muted}
              playsInline
            />

            {/* Dark gradient overlay bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

            {/* ── BOTTOM LEFT: user info + caption ── */}
            {/* pb-20 on mobile so not hidden by bottom navbar */}
            <div className="absolute bottom-0 left-0 right-14 p-4 pb-20 md:pb-6">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={reel.user?.profilePic || `https://ui-avatars.com/api/?name=${reel.user?.username || "U"}&background=6366f1&color=fff&size=40`}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white flex-shrink-0"
                  alt=""
                />
                <p className="text-white text-sm font-semibold drop-shadow">{reel.user?.username}</p>
              </div>
              {reel.caption && (
                <p className="text-white/90 text-sm drop-shadow line-clamp-2 leading-snug">{reel.caption}</p>
              )}
            </div>

            {/* ── RIGHT SIDE: action buttons ── */}
            {/* pb-20 on mobile so not hidden by bottom navbar */}
            <div className="absolute right-3 bottom-0 pb-20 md:pb-6 flex flex-col items-center gap-5">
              <button className="flex flex-col items-center gap-0.5 text-white">
                <FiHeart size={26} />
                <span className="text-[11px]">Like</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 text-white">
                <FiMessageCircle size={26} />
                <span className="text-[11px]">Comment</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 text-white">
                <FiSend size={26} />
                <span className="text-[11px]">Share</span>
              </button>
              <button onClick={() => setMuted(!muted)} className="text-white">
                {muted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />}
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}