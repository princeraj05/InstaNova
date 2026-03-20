import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"

import {
  FiHeart, FiMessageCircle, FiSend,
  FiBookmark, FiVolume2, FiVolumeX, FiX,
  FiMoreHorizontal, FiShare2
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
  const containerRef = useRef()
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const reelId = query.get("reelId")

  // FETCH REELS
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
            following: false,
          }
        })
        setReelStates(states)
      } catch (err) {
        console.log(err)
      }
    }
    fetchReels()
  }, [])

  // AUTO SCROLL TO reelId
  useEffect(() => {
    if (reelId && reels.length > 0) {
      const index = reels.findIndex(r => r._id === reelId)
      if (index !== -1) {
        setTimeout(() => {
          videoRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 300)
      }
    }
  }, [reels, reelId])

  // VIDEO AUTO PLAY via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const video = e.target
          if (e.isIntersecting) {
            video.play()
            const idx = videoRefs.current.indexOf(video)
            if (idx !== -1) setActiveIndex(idx)
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.7 }
    )
    videoRefs.current.forEach(v => v && observer.observe(v))
    return () => videoRefs.current.forEach(v => v && observer.unobserve(v))
  }, [reels])

  const updateReel = (id, patch) => {
    setReelStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

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

      {/* MAIN SCROLL AREA */}
      <div
        ref={containerRef}
        className="md:ml-64 flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ height: "100dvh" }}
      >
        {reels.map((reel, index) => {
          const s = reelStates[reel._id] || {}
          const isActive = activeIndex === index

          return (
            <div
              key={reel._id}
              className="snap-start relative flex items-center justify-center bg-black"
              style={{ height: "100dvh" }}
            >
              {/* ── VIDEO ── */}
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={reel.media}
                  className="w-full h-full object-cover"
                  loop
                  muted={muted}
                  playsInline
                  onClick={() => togglePause(index)}
                />

                {/* Pause Indicator */}
                {paused && isActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-sm rounded-full p-5 animate-pulse">
                      <FaPlay className="text-white w-8 h-8" />
                    </div>
                  </div>
                )}

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 pointer-events-none" />

                {/* ── TOP BAR ── */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 md:pt-6">
                  <span className="text-white font-bold text-lg tracking-tight hidden md:block">Reels</span>
                  {/* Mute button top-right for desktop */}
                  <button
                    onClick={() => setMuted(!muted)}
                    className="ml-auto bg-black/30 backdrop-blur-md border border-white/10 p-2.5 rounded-full text-white hover:bg-black/50 transition-all"
                  >
                    {muted
                      ? <FiVolumeX className="w-4 h-4 md:w-5 md:h-5" />
                      : <FiVolume2 className="w-4 h-4 md:w-5 md:h-5" />
                    }
                  </button>
                </div>

                {/* ── RIGHT ACTION BAR ── */}
                <div className="absolute right-3 bottom-24 md:right-6 md:bottom-28 flex flex-col items-center gap-5">

                  {/* LIKE */}
                  <button
                    onClick={() => handleLike(reel._id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <span className="bg-black/20 backdrop-blur-sm p-2.5 rounded-full group-hover:bg-black/40 transition-all group-active:scale-90">
                      {s.liked
                        ? <FaHeart className="text-red-500 w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
                        : <FiHeart className="text-white w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
                      }
                    </span>
                    <span className="text-white text-xs font-semibold drop-shadow">{s.likeCount}</span>
                  </button>

                  {/* COMMENT */}
                  <button
                    onClick={() => openComments(reel._id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <span className="bg-black/20 backdrop-blur-sm p-2.5 rounded-full group-hover:bg-black/40 transition-all group-active:scale-90">
                      <FiMessageCircle className="text-white w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
                    </span>
                    <span className="text-white text-xs font-semibold drop-shadow">
                      {comments[reel._id]?.length || 0}
                    </span>
                  </button>

                  {/* SHARE */}
                  <button
                    onClick={() => handleShare(reel)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <span className="bg-black/20 backdrop-blur-sm p-2.5 rounded-full group-hover:bg-black/40 transition-all group-active:scale-90">
                      <FiSend className="text-white w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
                    </span>
                    <span className="text-white text-xs font-semibold drop-shadow">Share</span>
                  </button>

                  {/* SAVE */}
                  <button
                    onClick={() => handleSave(reel._id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <span className="bg-black/20 backdrop-blur-sm p-2.5 rounded-full group-hover:bg-black/40 transition-all group-active:scale-90">
                      {s.saved
                        ? <FaBookmark className="text-yellow-400 w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
                        : <FiBookmark className="text-white w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
                      }
                    </span>
                    <span className="text-white text-xs font-semibold drop-shadow">Save</span>
                  </button>

                </div>

                {/* ── BOTTOM INFO ── */}
                <div className="absolute bottom-6 left-0 right-16 md:right-20 px-4 md:px-6">

                  {/* User info */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400 p-0.5 flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-black overflow-hidden">
                        {reel.user?.profilePic
                          ? <img src={reel.user.profilePic} alt="avatar" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                              {reel.user?.username?.[0]?.toUpperCase() || "U"}
                            </div>
                        }
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm md:text-base drop-shadow">
                        {reel.user?.username || "user"}
                      </span>
                      <button className="border border-white/70 text-white text-xs font-semibold px-3 py-0.5 rounded-full hover:bg-white hover:text-black transition-all">
                        Follow
                      </button>
                    </div>
                  </div>

                  {/* Caption */}
                  {reel.caption && (
                    <p className="text-white text-sm md:text-base leading-relaxed drop-shadow line-clamp-2">
                      {reel.caption}
                    </p>
                  )}

                  {/* Audio tag */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-lg">🎵</span>
                    <span className="text-white/80 text-xs truncate max-w-[180px] md:max-w-xs">
                      Original Audio • {reel.user?.username || "user"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {reels.length === 0 && (
          <div className="flex flex-col items-center justify-center h-screen gap-4 text-white/40">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
              <FaPlay className="w-6 h-6 ml-1" />
            </div>
            <p className="text-sm">No reels yet</p>
          </div>
        )}
      </div>

      {/* ── COMMENT PANEL ── */}
      {commentPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setCommentPanel(null)}
          />

          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 md:left-64 z-50 bg-white rounded-t-3xl flex flex-col shadow-2xl"
            style={{ maxHeight: "65vh" }}>

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                Comments
                {comments[commentPanel]?.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({comments[commentPanel].length})
                  </span>
                )}
              </h3>
              <button
                onClick={() => setCommentPanel(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-4">
              {(comments[commentPanel] || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300">
                  <FiMessageCircle size={32} />
                  <p className="text-sm">No comments yet. Be the first!</p>
                </div>
              ) : (
                (comments[commentPanel] || []).map(c => (
                  <div key={c._id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      {c.user?.profilePic
                        ? <img src={c.user.profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                        : <span className="text-white text-xs font-bold">
                            {c.user?.username?.[0]?.toUpperCase() || "U"}
                          </span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2">
                        <span className="text-xs font-semibold text-gray-900">{c.user?.username} </span>
                        <span className="text-sm text-gray-700">{c.text}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 px-1">
                        <span className="text-xs text-gray-400">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "Just now"
                          }
                        </span>
                        <button className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1">
                          <FiHeart size={11} /> Like
                        </button>
                        <button className="text-xs text-gray-400 hover:text-indigo-500 transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <input
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      submitComment(commentPanel)
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={() => submitComment(commentPanel)}
                  disabled={!commentInput.trim()}
                  className="text-indigo-500 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:text-indigo-700 transition-colors"
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