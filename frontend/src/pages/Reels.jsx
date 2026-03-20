import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"

import {
  FiHeart, FiMessageCircle, FiSend,
  FiBookmark, FiVolume2, FiVolumeX, FiX
} from "react-icons/fi"

import { FaHeart, FaBookmark, FaPlay } from "react-icons/fa"

export default function Reels() {

  const [reels, setReels] = useState([])
  const [muted, setMuted] = useState(false)
  const [reelStates, setReelStates] = useState({})
  const [commentPanel, setCommentPanel] = useState(null)
  const [comments, setComments] = useState({})
  const [commentInput, setCommentInput] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const videoRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const reelId = query.get("reelId")

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
            liked: r.likes?.includes(me._id) || false,
            likeCount: r.likes?.length || 0,
            saved: false,
          }
        })
        setReelStates(states)
      } catch (err) { console.log(err) }
    }
    fetchReels()
  }, [])

  useEffect(() => {
    if (reelId && reels.length > 0) {
      const index = reels.findIndex(r => r._id === reelId)
      if (index !== -1) {
        setTimeout(() => {
          videoRefs.current[index]?.closest("[data-snap]")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 300)
      }
    }
  }, [reels, reelId])

  // ── Single IntersectionObserver on the ONE video element per reel ──
  useEffect(() => {
    if (videoRefs.current.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const video = e.target
          if (e.isIntersecting) {
            video.play().catch(() => {})
            const idx = videoRefs.current.indexOf(video)
            if (idx !== -1) setActiveIndex(idx)
            setPaused(false)
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    videoRefs.current.forEach(v => v && observer.observe(v))
    return () => videoRefs.current.forEach(v => v && observer.unobserve(v))
  }, [reels])

  const updateReel = (id, patch) =>
    setReelStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const handleLike = async (id) => {
    try {
      const { data } = await API.post(`/reels/${id}/like`)
      updateReel(id, { liked: data.liked, likeCount: data.likes.length })
    } catch (err) { console.log(err) }
  }

  const handleSave = async (id) => {
    try {
      const { data } = await API.post(`/reels/${id}/save`)
      updateReel(id, { saved: data.saved })
    } catch (err) { console.log(err) }
  }

  const openComments = async (id) => {
    setCommentPanel(id)
    if (!comments[id]) {
      try {
        const { data } = await API.get(`/reels/${id}/comments`)
        setComments(prev => ({ ...prev, [id]: data }))
      } catch (err) { console.log(err) }
    }
  }

  const submitComment = async (id) => {
    if (!commentInput.trim()) return
    try {
      const { data } = await API.post(`/reels/${id}/comment`, { text: commentInput })
      setComments(prev => ({ ...prev, [id]: [data, ...(prev[id] || [])] }))
      setCommentInput("")
    } catch (err) { console.log(err) }
  }

  const handleShare = (reel) => {
    navigate("/messages", { state: { shareReel: reel } })
  }

  const togglePause = (index) => {
    const video = videoRefs.current[index]
    if (!video) return
    if (video.paused) { video.play(); setPaused(false) }
    else { video.pause(); setPaused(true) }
  }

  return (
    <div className="flex bg-black min-h-screen">
      <Navbar />

      {/* ── Scroll container ── */}
      <div
        className="flex-1 md:ml-64 overflow-y-scroll snap-y snap-mandatory"
        style={{ height: "100dvh", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reels.map((reel, index) => {
          const s = reelStates[reel._id] || {}
          const isActive = activeIndex === index

          return (
            /*
              ONE snap section per reel.
              Mobile  → video fills full screen, actions overlaid on right
              Desktop → video is a centered 9:16 card, actions are to its right
              
              KEY: only ONE <video> element per reel → no ref conflict → autoplay works everywhere
            */
            <div
              key={reel._id}
              data-snap
              className="snap-start flex items-center justify-center bg-black"
              style={{ height: "100dvh" }}
            >

              {/* ════════════ MOBILE wrapper ════════════
                  Full screen — video is 100% w × 100% h
              */}
              <div className="relative w-full h-full md:hidden">

                {/* ── SINGLE VIDEO ── */}
                <video
                  ref={el => { videoRefs.current[index] = el }}
                  src={reel.media}
                  className="w-full h-full object-cover"
                  loop
                  muted={muted}
                  playsInline
                  onClick={() => togglePause(index)}
                />

                {/* Pause indicator */}
                {paused && isActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="bg-black/40 rounded-full p-5">
                      <FaPlay className="text-white w-8 h-8" />
                    </div>
                  </div>
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent pointer-events-none" />

                {/* Mute */}
                <button
                  onClick={() => setMuted(!muted)}
                  className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm p-2.5 rounded-full text-white z-10"
                >
                  {muted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                </button>

                {/* Right actions */}
                <div className="absolute right-3 bottom-32 z-10 flex flex-col items-center gap-5">
                  <button onClick={() => handleLike(reel._id)} className="flex flex-col items-center gap-0.5">
                    {s.liked ? <FaHeart className="text-red-500 w-7 h-7 drop-shadow" /> : <FiHeart className="text-white w-7 h-7 drop-shadow" />}
                    <span className="text-white text-xs font-semibold">{s.likeCount}</span>
                  </button>
                  <button onClick={() => openComments(reel._id)} className="flex flex-col items-center gap-0.5">
                    <FiMessageCircle className="text-white w-7 h-7 drop-shadow" />
                    <span className="text-white text-xs font-semibold">{comments[reel._id]?.length || 0}</span>
                  </button>
                  <button onClick={() => handleShare(reel)} className="flex flex-col items-center gap-0.5">
                    <FiSend className="text-white w-7 h-7 drop-shadow" />
                    <span className="text-white text-xs font-semibold">Share</span>
                  </button>
                  <button onClick={() => handleSave(reel._id)} className="flex flex-col items-center gap-0.5">
                    {s.saved ? <FaBookmark className="text-yellow-400 w-6 h-6" /> : <FiBookmark className="text-white w-6 h-6" />}
                    <span className="text-white text-xs font-semibold">Save</span>
                  </button>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-8 left-4 right-20 z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 p-0.5 flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                        {reel.user?.profilePic
                          ? <img src={reel.user.profilePic} className="w-full h-full object-cover" alt="" />
                          : <span className="text-white text-sm font-bold">{reel.user?.username?.[0]?.toUpperCase() || "U"}</span>}
                      </div>
                    </div>
                    <span className="text-white font-semibold text-sm">{reel.user?.username || "user"}</span>
                    <button className="border border-white/80 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">Follow</button>
                  </div>
                  {reel.caption && <p className="text-white text-sm leading-snug line-clamp-2 mb-1.5">{reel.caption}</p>}
                  <div className="flex items-center gap-1.5">
                    <span>🎵</span>
                    <span className="text-white/80 text-xs truncate">Original Audio • {reel.user?.username || "user"}</span>
                  </div>
                </div>
              </div>

              {/* ════════════ DESKTOP wrapper ════════════
                  9:16 card centered + actions to the right
                  Still uses the SAME video ref — but we render
                  a fresh <video> element here (desktop only visible)
                  so IntersectionObserver works on the visible one.
              ════════════ */}
              <div className="hidden md:flex items-center justify-center gap-6 w-full h-full">

                {/* 9:16 card */}
                <div
                  className="relative flex-shrink-0 rounded-2xl overflow-hidden bg-black shadow-2xl"
                  style={{
                    height: "min(88vh, 780px)",
                    width: "calc(min(88vh, 780px) * 9 / 16)",
                  }}
                >
                  {/*
                    Desktop video — separate element so the observer
                    can target whichever is actually visible on screen.
                    We store it in a parallel ref array.
                  */}
                  <video
                    ref={el => { videoRefs.current[index] = el }}
                    src={reel.media}
                    className="w-full h-full object-cover"
                    loop muted={muted} playsInline
                    onClick={() => togglePause(index)}
                  />

                  {paused && isActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="bg-black/40 rounded-full p-5">
                        <FaPlay className="text-white w-8 h-8" />
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent pointer-events-none" />

                  <button
                    onClick={() => setMuted(!muted)}
                    className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition z-10"
                  >
                    {muted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                  </button>

                  <div className="absolute bottom-5 left-4 right-4 z-10">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 p-0.5 flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                          {reel.user?.profilePic
                            ? <img src={reel.user.profilePic} className="w-full h-full object-cover" alt="" />
                            : <span className="text-white text-sm font-bold">{reel.user?.username?.[0]?.toUpperCase() || "U"}</span>}
                        </div>
                      </div>
                      <span className="text-white font-semibold text-sm">{reel.user?.username || "user"}</span>
                      <button className="border border-white/80 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full hover:bg-white hover:text-black transition-all">Follow</button>
                    </div>
                    {reel.caption && <p className="text-white text-sm leading-snug line-clamp-2 mb-1.5">{reel.caption}</p>}
                    <div className="flex items-center gap-1.5">
                      <span>🎵</span>
                      <span className="text-white/80 text-xs truncate">Original Audio • {reel.user?.username || "user"}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop right actions */}
                <div className="flex flex-col items-center gap-6 flex-shrink-0">
                  <button onClick={() => handleLike(reel._id)} className="flex flex-col items-center gap-1 group">
                    <span className="p-2 rounded-full group-hover:bg-white/10 transition">
                      {s.liked ? <FaHeart className="text-red-500 w-7 h-7" /> : <FiHeart className="text-white w-7 h-7" />}
                    </span>
                    <span className="text-white text-xs font-semibold">{s.likeCount}</span>
                  </button>
                  <button onClick={() => openComments(reel._id)} className="flex flex-col items-center gap-1 group">
                    <span className="p-2 rounded-full group-hover:bg-white/10 transition">
                      <FiMessageCircle className="text-white w-7 h-7" />
                    </span>
                    <span className="text-white text-xs font-semibold">{comments[reel._id]?.length || 0}</span>
                  </button>
                  <button onClick={() => handleShare(reel)} className="flex flex-col items-center gap-1 group">
                    <span className="p-2 rounded-full group-hover:bg-white/10 transition">
                      <FiSend className="text-white w-7 h-7" />
                    </span>
                    <span className="text-white text-xs font-semibold">Share</span>
                  </button>
                  <button onClick={() => handleSave(reel._id)} className="flex flex-col items-center gap-1 group">
                    <span className="p-2 rounded-full group-hover:bg-white/10 transition">
                      {s.saved ? <FaBookmark className="text-yellow-400 w-6 h-6" /> : <FiBookmark className="text-white w-6 h-6" />}
                    </span>
                    <span className="text-white text-xs font-semibold">Save</span>
                  </button>
                </div>
              </div>

            </div>
          )
        })}

        {reels.length === 0 && (
          <div className="flex flex-col items-center justify-center h-screen gap-4 text-white/40">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
              <FaPlay className="w-6 h-6 ml-1" />
            </div>
            <p className="text-sm">No reels yet</p>
          </div>
        )}
      </div>

      {/* ── Comment Panel ── */}
      {commentPanel && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setCommentPanel(null)} />
          <div
            className="fixed bottom-0 left-0 right-0 md:left-64 z-50 bg-white rounded-t-3xl flex flex-col shadow-2xl"
            style={{ maxHeight: "70vh" }}
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-900 text-base">
                Comments
                {comments[commentPanel]?.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">({comments[commentPanel].length})</span>
                )}
              </h3>
              <button onClick={() => setCommentPanel(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <FiX size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-4 min-h-0">
              {(comments[commentPanel] || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300">
                  <FiMessageCircle size={32} />
                  <p className="text-sm">No comments yet. Be the first!</p>
                </div>
              ) : (
                (comments[commentPanel] || []).map(c => (
                  <div key={c._id} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {c.user?.profilePic
                        ? <img src={c.user.profilePic} className="w-full h-full object-cover" alt="" />
                        : <span className="text-white text-xs font-bold">{c.user?.username?.[0]?.toUpperCase() || "U"}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2">
                        <span className="text-xs font-semibold text-gray-900">{c.user?.username} </span>
                        <span className="text-sm text-gray-700 break-words">{c.text}</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 ml-1 block">
                        {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
                <input
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(commentPanel) } }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={() => submitComment(commentPanel)}
                  disabled={!commentInput.trim()}
                  className="text-indigo-500 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:text-indigo-700 transition-colors flex-shrink-0"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}