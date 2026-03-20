import { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiX } from "react-icons/fi"
import { FaHeart, FaBookmark } from "react-icons/fa"

export default function Home() {

  const [posts, setPosts] = useState([])
  const [postStates, setPostStates] = useState({})
  const [commentPanel, setCommentPanel] = useState(null)
  const [comments, setComments] = useState({})
  const [commentInput, setCommentInput] = useState("")
  const videoRefs = useRef([])

  const me = JSON.parse(localStorage.getItem("user") || "{}")

  // ================= FETCH POSTS =================
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get("/posts")
        setPosts(res.data)
      } catch (err) { console.log(err) }
    }
    fetchPosts()
  }, [])

  // ================= INITIAL STATE =================
  useEffect(() => {
    const states = {}
    posts.forEach(p => {
      states[p._id] = {
        liked: p.likes?.includes(me._id),
        likeCount: p.likes?.length || 0,
        saved: p.savedBy?.includes(me._id) || false
      }
    })
    setPostStates(states)
  }, [posts])

  // ================= VIDEO AUTO PLAY =================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (entry.isIntersecting) { video.play() }
          else { video.pause() }
        })
      },
      { threshold: 0.6 }
    )
    videoRefs.current.forEach(v => v && observer.observe(v))
    return () => observer.disconnect()
  }, [posts])

  // ================= LIKE =================
  const handleLike = async (id) => {
    try {
      const { data } = await API.post(`/posts/${id}/like`, {
        userId: me._id
      })
      setPostStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          liked: data.liked,
          likeCount: data.likes.length
        }
      }))
    } catch (err) { console.log(err) }
  }

  // ================= SAVE =================
  const handleSave = async (id) => {
    try {
      const { data } = await API.post(`/posts/${id}/save`, {
        userId: me._id
      })
      setPostStates(prev => ({
        ...prev,
        [id]: { ...prev[id], saved: data.saved }
      }))
    } catch (err) { console.log(err) }
  }

  // ================= COMMENTS =================
  const openComments = async (id) => {
    setCommentPanel(id)
    if (!comments[id]) {
      try {
        const { data } = await API.get(`/posts/${id}/comments`)
        setComments(prev => ({ ...prev, [id]: data }))
      } catch (err) { console.log(err) }
    }
  }

  const submitComment = async (id) => {
    if (!commentInput.trim()) return
    try {
      const { data } = await API.post(`/posts/${id}/comment`, {
        text: commentInput,
        userId: me._id
      })
      setComments(prev => ({
        ...prev,
        [id]: [data, ...(prev[id] || [])]
      }))
      setCommentInput("")
    } catch (err) { console.log(err) }
  }

  // ================= UI =================
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />

      <div className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-xl px-4 py-6 pb-20 md:pb-6">

          <h2 className="text-xl font-bold text-gray-900 mb-5">Feed</h2>

          {posts.map((post, index) => {
            const s = postStates[post._id] || {}

            return (
              <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5 overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                  <img
                    src={post.user?.profilePic || `https://ui-avatars.com/api/?name=${post.user?.username}`}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{post.user?.username}</p>
                  </div>
                </div>

                {/* MEDIA */}
                {post.mediaType === "reel" ? (
                  <video
                    ref={el => videoRefs.current[index] = el}
                    src={post.media}
                    className="w-full aspect-square object-cover"
                    loop muted playsInline
                  />
                ) : (
                  <img src={post.media} className="w-full aspect-square object-cover" />
                )}

                {/* ACTIONS */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">

                    <div className="flex items-center gap-4">

                      {/* LIKE */}
                      <button onClick={() => handleLike(post._id)}>
                        {s.liked
                          ? <FaHeart className="text-red-500" size={22} />
                          : <FiHeart size={22} />}
                      </button>

                      {/* COMMENT */}
                      <button onClick={() => openComments(post._id)}>
                        <FiMessageCircle size={22} />
                      </button>

                      {/* SHARE */}
                      <button>
                        <FiSend size={22} />
                      </button>
                    </div>

                    {/* SAVE */}
                    <button onClick={() => handleSave(post._id)}>
                      {s.saved
                        ? <FaBookmark className="text-yellow-500" size={22} />
                        : <FiBookmark size={22} />}
                    </button>

                  </div>

                  {/* LIKE COUNT */}
                  <p className="text-sm font-semibold mb-1">
                    {s.likeCount} likes
                  </p>

                  {/* CAPTION */}
                  {post.caption && (
                    <p className="text-sm">
                      <span className="font-semibold mr-1">{post.user?.username}</span>
                      {post.caption}
                    </p>
                  )}
                </div>

              </div>
            )
          })}

        </div>
      </div>

      {/* ================= COMMENT PANEL ================= */}
      {commentPanel && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setCommentPanel(null)} />

          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white z-50 rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Comments</h3>
              <button onClick={() => setCommentPanel(null)}>
                <FiX />
              </button>
            </div>

            {(comments[commentPanel] || []).map(c => (
              <p key={c._id} className="text-sm mb-2">
                <b>{c.user?.username}</b> {c.text}
              </p>
            ))}

            <div className="flex gap-2 mt-3">
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="Add comment..."
                className="flex-1 border px-3 py-2 rounded-full text-sm"
              />
              <button onClick={() => submitComment(commentPanel)} className="text-blue-500">
                Post
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  )
}