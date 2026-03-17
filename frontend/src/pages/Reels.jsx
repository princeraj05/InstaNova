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
      { threshold: 0.8 }
    )
    videoRefs.current.forEach(v => { if (v) observer.observe(v) })
    return () => { videoRefs.current.forEach(v => { if (v) observer.unobserve(v) }) }
  }, [reels])

  return (
    <div className="flex bg-black min-h-screen">
      <Navbar />

      {/* Reels scroll container */}
      <div className="flex-1 md:ml-64 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none pb-16 md:pb-0">
        {reels.map((reel, index) => (
          <div key={reel._id}
            className="relative h-screen flex justify-center items-center snap-start snap-always bg-black">

            {/* Video - correct 9:16 ratio */}
            <div className="relative h-full max-h-screen w-full flex items-center justify-center">
              <video
                ref={el => videoRefs.current[index] = el}
                src={reel.media}
                className="h-full w-auto max-w-full object-contain"
                style={{ maxHeight: "100svh", aspectRatio: "9/16" }}
                loop
                muted={muted}
                playsInline
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* User info bottom left */}
              <div className="absolute bottom-20 left-4 right-16 md:bottom-6">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={reel.user?.profilePic || `https://ui-avatars.com/api/?name=${reel.user?.username}&background=6366f1&color=fff&size=40`}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white"
                  />
                  <p className="text-white text-sm font-semibold drop-shadow">{reel.user?.username}</p>
                </div>
                {reel.caption && (
                  <p className="text-white text-sm drop-shadow line-clamp-2">{reel.caption}</p>
                )}
              </div>

              {/* Action buttons right */}
              <div className="absolute right-3 bottom-24 md:bottom-10 flex flex-col items-center gap-5">
                <button className="flex flex-col items-center gap-1 text-white">
                  <div className="w-10 h-10 flex items-center justify-center"><FiHeart size={26} /></div>
                  <span className="text-xs">Like</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-white">
                  <div className="w-10 h-10 flex items-center justify-center"><FiMessageCircle size={26} /></div>
                  <span className="text-xs">Comment</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-white">
                  <div className="w-10 h-10 flex items-center justify-center"><FiSend size={26} /></div>
                  <span className="text-xs">Share</span>
                </button>
                <button onClick={() => setMuted(!muted)} className="text-white">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {muted ? <FiVolumeX size={22} /> : <FiVolume2 size={22} />}
                  </div>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}