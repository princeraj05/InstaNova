import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"

import {
  FiHeart, FiMessageCircle, FiSend,
  FiBookmark, FiVolume2, FiVolumeX, FiX
} from "react-icons/fi"

import { FaHeart, FaBookmark } from "react-icons/fa"

export default function Reels() {

  const [reels, setReels] = useState([])
  const [muted, setMuted] = useState(false)
  const [userCache, setUserCache] = useState({})
  const [reelStates, setReelStates] = useState({})

  const [commentPanel, setCommentPanel] = useState(null)
  const [comments, setComments] = useState({})
  const [commentInput, setCommentInput] = useState("")

  const videoRefs = useRef([])
  const navigate = useNavigate()

  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const reelId = query.get("reelId")

  // 🔥 FETCH REELS
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

  // 🔥 AUTO SCROLL
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

  // 🔥 VIDEO AUTO PLAY
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.play()
          else e.target.pause()
        })
      },
      { threshold: 0.7 }
    )

    videoRefs.current.forEach(v => v && observer.observe(v))

    return () => {
      videoRefs.current.forEach(v => v && observer.unobserve(v))
    }
  }, [reels])

  const updateReel = (id, patch) => {
    setReelStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...patch }
    }))
  }

  // ❤️ LIKE
  const handleLike = async (id) => {
    try {
      const { data } = await API.post(`/reels/${id}/like`)
      updateReel(id, {
        liked: data.liked,
        likeCount: data.likes.length
      })
    } catch (err) {
      console.log(err)
    }
  }

  // 🔖 SAVE
  const handleSave = async (id) => {
    try {
      const { data } = await API.post(`/reels/${id}/save`)
      updateReel(id, { saved: data.saved })
    } catch (err) {
      console.log(err)
    }
  }

  // 💬 OPEN COMMENTS
  const openComments = async (id) => {
    console.log("CLICK COMMENT:", id)

    setCommentPanel(id)

    if (!comments[id]) {
      try {
        const { data } = await API.get(`/reels/${id}/comments`)
        setComments(prev => ({ ...prev, [id]: data }))
      } catch (err) {
        console.log(err)
      }
    }
  }

  // 💬 ADD COMMENT
  const submitComment = async (id) => {
    if (!commentInput.trim()) return

    try {
      const { data } = await API.post(`/reels/${id}/comment`, {
        text: commentInput
      })

      setComments(prev => ({
        ...prev,
        [id]: [data, ...(prev[id] || [])]
      }))

      setCommentInput("")

    } catch (err) {
      console.log(err)
    }
  }

  // 📤 SHARE
  const handleShare = (reel) => {
    navigate("/messages", { state: { shareReel: reel } })
  }

  return (
    <div className="flex bg-black min-h-screen">

      <Navbar />

      <div className="md:ml-64 flex-1 overflow-y-scroll snap-y snap-mandatory" style={{ height: "100dvh" }}>

        {reels.map((reel, index) => {
          const s = reelStates[reel._id] || {}

          return (
            <div key={reel._id} className="snap-start flex items-center justify-center" style={{ height: "100dvh" }}>

              <div className="relative w-full h-full">

                <video
                  ref={el => videoRefs.current[index] = el}
                  src={reel.media}
                  className="w-full h-full object-cover"
                  loop
                  muted={muted}
                  playsInline
                />

                {/* ACTIONS */}
                <div className="absolute right-3 bottom-20 flex flex-col gap-5">

                  {/* LIKE */}
                  <button onClick={() => handleLike(reel._id)}>
                    {s.liked ? <FaHeart className="text-red-500" size={24} /> : <FiHeart size={24} className="text-white" />}
                    <p className="text-white text-xs text-center">{s.likeCount}</p>
                  </button>

                  {/* COMMENT */}
                  <button onClick={() => openComments(reel._id)}>
                    <FiMessageCircle size={24} className="text-white" />
                  </button>

                  {/* SHARE */}
                  <button onClick={() => handleShare(reel)}>
                    <FiSend size={24} className="text-white" />
                  </button>

                  {/* SAVE */}
                  <button onClick={() => handleSave(reel._id)}>
                    {s.saved ? <FaBookmark className="text-yellow-400" size={24} /> : <FiBookmark size={24} className="text-white" />}
                  </button>

                  {/* MUTE */}
                  <button onClick={() => setMuted(!muted)} className="text-white">
                    {muted ? <FiVolumeX /> : <FiVolume2 />}
                  </button>

                </div>

              </div>
            </div>
          )
        })}

      </div>

      {/* 🔥 COMMENT PANEL */}
      {commentPanel && (
        <div className="fixed bottom-0 left-0 right-0 bg-white h-[60vh] z-50 rounded-t-2xl p-4 overflow-y-auto">

          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Comments</h3>
            <FiX size={22} onClick={() => setCommentPanel(null)} className="cursor-pointer" />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {(comments[commentPanel] || []).map(c => (
              <div key={c._id} className="text-sm">
                <b>{c.user?.username}</b> {c.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border px-3 py-2 rounded-lg"
            />
            <button
              onClick={() => submitComment(commentPanel)}
              className="bg-indigo-500 text-white px-4 rounded-lg"
            >
              Post
            </button>
          </div>

        </div>
      )}

    </div>
  )
}