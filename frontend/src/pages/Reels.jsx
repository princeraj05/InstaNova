import { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiVolume2, FiVolumeX } from "react-icons/fi"

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

      {/* ── SCROLL CONTAINER ── */}
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

            {/* ── MOBILE: fullscreen cover ── */}
            <div className="relative w-full h-full md:hidden">
              <video
                ref={el => videoRefs.current[index] = el}
                src={reel.media}
                className="absolute inset-0 w-full h-full object-cover"
                loop muted={muted} playsInline
              />

              {/* gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent pointer-events-none" />

              {/* bottom left: avatar + username + caption */}
              <div className="absolute bottom-0 left-0 right-14 px-4 pb-24">
                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src={reel.user?.profilePic
                      ? reel.user.profilePic
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.user?.username || "U")}&background=6366f1&color=fff&size=40`
                    }
                    className="w-9 h-9 rounded-full object-cover border-2 border-white flex-shrink-0"
                    alt=""
                  />
                  <p className="text-white text-sm font-semibold drop-shadow">{reel.user?.username}</p>
                </div>
                {reel.caption && (
                  <p className="text-white/90 text-sm leading-snug line-clamp-2 drop-shadow">{reel.caption}</p>
                )}
              </div>

              {/* right action buttons */}
              <div className="absolute right-3 bottom-0 pb-24 flex flex-col items-center gap-5">
                <button className="flex flex-col items-center gap-0.5 text-white">
                  <FiHeart size={26} /><span className="text-[11px]">Like</span>
                </button>
                <button className="flex flex-col items-center gap-0.5 text-white">
                  <FiMessageCircle size={26} /><span className="text-[11px]">Comment</span>
                </button>
                <button className="flex flex-col items-center gap-0.5 text-white">
                  <FiSend size={26} /><span className="text-[11px]">Share</span>
                </button>
                <button onClick={() => setMuted(!muted)} className="text-white">
                  {muted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />}
                </button>
              </div>
            </div>

            {/* ── DESKTOP: Instagram-style centered 9:16 with right sidebar ── */}
            <div className="hidden md:flex w-full h-full items-center justify-center gap-4 px-8">

              {/* 9:16 video box */}
              <div
                className="relative bg-black rounded-xl overflow-hidden flex-shrink-0"
                style={{ height: "min(90dvh, 720px)", aspectRatio: "9/16" }}
              >
                <video
                  ref={el => { if (!videoRefs.current[index]) videoRefs.current[index] = el }}
                  src={reel.media}
                  className="w-full h-full object-cover"
                  loop muted={muted} playsInline
                />
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                {/* bottom left info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src={reel.user?.profilePic
                        ? reel.user.profilePic
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.user?.username || "U")}&background=6366f1&color=fff&size=40`
                      }
                      className="w-9 h-9 rounded-full object-cover border-2 border-white flex-shrink-0"
                      alt=""
                    />
                    <p className="text-white text-sm font-semibold">{reel.user?.username}</p>
                    <button className="ml-2 px-3 py-0.5 border border-white/70 text-white text-xs rounded-full hover:bg-white/20 transition">
                      Follow
                    </button>
                  </div>
                  {reel.caption && (
                    <p className="text-white/90 text-sm line-clamp-2 leading-snug">{reel.caption}</p>
                  )}
                </div>

                {/* mute button inside video */}
                <button
                  onClick={() => setMuted(!muted)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition"
                >
                  {muted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                </button>
              </div>

              {/* right action sidebar — Instagram style */}
              <div className="flex flex-col items-center gap-6">
                <button className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                    <FiHeart size={20} />
                  </div>
                  <span className="text-xs text-white/70">Like</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-white hover:text-indigo-400 transition">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                    <FiMessageCircle size={20} />
                  </div>
                  <span className="text-xs text-white/70">Comment</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-white hover:text-indigo-400 transition">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                    <FiSend size={20} />
                  </div>
                  <span className="text-xs text-white/70">Share</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-white hover:text-indigo-400 transition">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                    <FiBookmark size={20} />
                  </div>
                  <span className="text-xs text-white/70">Save</span>
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>
    </div>
  )
}