import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { io } from "socket.io-client"

export default function Messages() {

  const location = useLocation()
  const navigate = useNavigate()
  const sharedReel = location.state?.shareReel
  const sharedPost = location.state?.sharePost
  const userId = localStorage.getItem("userId")

  const [message, setMessage] = useState(
    sharedReel ? "📤 Shared a reel" :
    sharedPost ? "📤 Shared a post" : ""
  )
  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [conversationUsers, setConversationUsers] = useState({})
  const [sending, setSending] = useState(false)
  const [view, setView] = useState("sidebar")

  const socket = useRef()
  const messagesEndRef = useRef()
  const conversationRef = useRef()
  const me = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => { conversationRef.current = conversation }, [conversation])

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SERVER_URL, { transports: ["websocket"] })
    socket.current.emit("addUser", userId)
    socket.current.on("newMessage", (data) => {
      if (data.conversationId?.toString() === conversationRef.current?._id?.toString()) {
        setMessages(prev => {
          if (prev.some(m => m._id === data._id)) return prev
          return [...prev, data]
        })
      }
    })
    return () => socket.current.disconnect()
  }, [])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await API.get(`/conversations/${userId}`)
        const seen = new Set()
        const unique = []
        for (const conv of res.data) {
          const friendId = conv.members.find(id => id !== userId)
          if (!friendId || seen.has(friendId)) continue
          seen.add(friendId)
          unique.push(conv)
        }
        setConversations(unique)
        const userMap = {}
        await Promise.all(unique.map(async (conv) => {
          const friendId = conv.members.find(id => id !== userId)
          if (friendId) {
            try {
              const r = await API.get(`/user/${friendId}`)
              userMap[friendId] = r.data
            } catch { userMap[friendId] = { username: "Unknown", profilePic: null } }
          }
        }))
        setConversationUsers(userMap)
      } catch (err) { console.log(err) }
    }
    fetchConversations()
  }, [])

  const handleSearch = async (e) => {
    const val = e.target.value
    setSearch(val)
    if (val.length > 0) {
      try { const r = await API.get(`/search?username=${val}`); setUsers(r.data) }
      catch { setUsers([]) }
    } else setUsers([])
  }

  const selectUser = async (user) => {
    setSelectedUser(user)
    const res = await API.post("/conversations", { senderId: userId, receiverId: user._id })
    setConversation(res.data)
    const msgs = await API.get(`/messages/${res.data._id}`)
    setMessages(msgs.data)
    setSearch(""); setUsers([]); setView("chat")
  }

  const openConversation = async (conv) => {
    const friendId = conv.members.find(id => id !== userId)
    if (!friendId) return
    const resUser = await API.get(`/user/${friendId}`)
    setSelectedUser(resUser.data)
    setConversation(conv)
    const msgs = await API.get(`/messages/${conv._id}`)
    setMessages(msgs.data)
    setView("chat")
  }

  const sendMessage = async () => {
    if (!conversation || !message.trim() || sending) return
    setSending(true)
    try {
      const { data } = await API.post("/messages", {
        conversationId: conversation._id,
        sender: userId,
        text: message,
        reel: sharedReel?._id || null,
        post: sharedPost?._id || null,
      })
      setMessages(prev => prev.some(m => m._id === data._id) ? prev : [...prev, data])
      socket.current.emit("sendMessage", {
        senderId: userId,
        receiverId: selectedUser._id,
        text: message,
        conversationId: conversation._id,
        _id: data._id
      })
      setMessage("")
    } catch (err) { console.error(err) }
    finally { setSending(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""

  const formatConvTime = (d) => {
    if (!d) return ""
    const date = new Date(d)
    const diff = Math.floor((Date.now() - date) / 86400000)
    if (diff === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    if (diff === 1) return "Yesterday"
    if (diff < 7) return date.toLocaleDateString([], { weekday: "short" })
    return date.toLocaleDateString([], { day: "2-digit", month: "short" })
  }

  const avatarSrc = (user) => {
    if (user?.profilePic && user.profilePic.trim() !== "") return user.profilePic
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=128&bold=true`
  }
  const avatarErr = (e, user) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=128&bold=true`
  }

  // Shared preview banner
  const SharedPreview = () => {
    if (sharedPost) return (
      <div className="mx-3 mb-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3 px-3 py-2 flex-shrink-0">
        {sharedPost.media && (
          <img src={sharedPost.media} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-indigo-700">Sharing a Post</p>
          <p className="text-xs text-indigo-400 truncate">{sharedPost.caption || "Post"}</p>
        </div>
      </div>
    )
    if (sharedReel) return (
      <div className="mx-3 mb-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3 px-3 py-2 flex-shrink-0">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-indigo-700">Sharing a Reel</p>
          <p className="text-xs text-indigo-400 truncate">{sharedReel.caption || "Reel"}</p>
        </div>
      </div>
    )
    return null
  }

  // Message bubble
  const MessageBubble = ({ m, isMine, senderUser, isLastInGroup }) => (
    <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      <div className="flex-shrink-0 w-8">
        {isLastInGroup
          ? <img src={avatarSrc(senderUser)} onError={e => avatarErr(e, senderUser)} className="w-8 h-8 rounded-full object-cover" alt="" />
          : <div className="w-8 h-8" />}
      </div>
      <div className={`flex flex-col gap-1 max-w-[65vw] md:max-w-sm lg:max-w-md ${isMine ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl overflow-hidden shadow-sm ${isMine ? "bg-indigo-500 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none border border-gray-100"}`}>

          {m.text && <p className="px-4 py-2.5 text-sm leading-relaxed break-words">{m.text}</p>}

          {/* 🔥 SHARED POST bubble */}
          {m.post && (
            <div className="cursor-pointer">
              {m.post.media && (
                <img src={m.post.media} className="w-full max-h-48 object-cover" />
              )}
              <div className={`px-3 py-2 ${isMine ? "bg-white/10" : "bg-gray-50"}`}>
                <p className={`text-xs font-semibold ${isMine ? "text-white" : "text-gray-700"}`}>
                  {m.post.user?.username || "Post"}
                </p>
                {m.post.caption && (
                  <p className={`text-xs truncate ${isMine ? "text-indigo-200" : "text-gray-400"}`}>
                    {m.post.caption}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 🔥 SHARED REEL bubble */}
          {m.reel && (
            <div onClick={() => navigate(`/reels?reelId=${m.reel._id || m.reel}`)} className="cursor-pointer group">
              {m.reel.media ? (
                <div className="relative">
                  <video src={m.reel.media} className="w-full max-h-48 object-cover" muted playsInline />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-indigo-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`mx-3 my-2 rounded-xl flex items-center gap-2.5 px-3 py-2.5 ${isMine ? "bg-white/20" : "bg-indigo-50 border border-indigo-100"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isMine ? "bg-white/30" : "bg-indigo-500"}`}>
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${isMine ? "text-white" : "text-indigo-600"}`}>View Reel</p>
                    <p className={`text-xs ${isMine ? "text-indigo-200" : "text-indigo-400"}`}>Tap to open</p>
                  </div>
                </div>
              )}
              {m.reel.media && <p className={`text-xs px-3 pb-2 pt-0.5 ${isMine ? "text-indigo-200" : "text-indigo-500"}`}>🎬 Tap to open reel</p>}
            </div>
          )}
        </div>
        {isLastInGroup && <span className="text-xs text-gray-400 px-1">{formatTime(m.createdAt)}</span>}
      </div>
    </div>
  )

  const InputBar = ({ px = "px-3" }) => (
    <div className={`flex-shrink-0 flex items-center gap-2 ${px} py-3 bg-white border-t border-gray-100`}>
      <img src={avatarSrc(me)} onError={e => avatarErr(e, me)} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="me" />
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        autoComplete="off"
        className="flex-1 min-w-0 border border-gray-200 px-3 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 transition"
      />
      <button
        onClick={sendMessage}
        disabled={sending || !message.trim()}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-colors"
      >
        <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  )

  const SidebarContent = () => (
    <>
      {users.length > 0 && (
        <div className="border-b border-gray-100 flex-shrink-0">
          <p className="px-5 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Results</p>
          {users.map(u => (
            <div key={u._id} onClick={() => selectUser(u)}
              className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-indigo-50 transition-colors">
              <img src={avatarSrc(u)} onError={e => avatarErr(e, u)} className="w-11 h-11 rounded-full object-cover flex-shrink-0" alt={u.username} />
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{u.username}</p>
                <p className="text-xs text-gray-400">Tap to message</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {search === "" && conversations.length > 0 && (
          <p className="px-5 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent</p>
        )}
        {search === "" && conversations.map(c => {
          const friendId = c.members.find(id => id !== userId)
          const friend = conversationUsers[friendId]
          const isActive = conversation?._id === c._id
          return (
            <div key={c._id} onClick={() => openConversation(c)}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${isActive ? "bg-indigo-50 border-r-4 border-indigo-500" : "hover:bg-gray-50"}`}>
              <div className="relative flex-shrink-0">
                <img src={avatarSrc(friend)} onError={e => avatarErr(e, friend)} className="w-12 h-12 rounded-full object-cover" alt={friend?.username} />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">{friend?.username}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatConvTime(c.updatedAt || c.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">Tap to open chat</p>
              </div>
            </div>
          )
        })}
        {search === "" && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300 gap-2">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm">No conversations yet</p>
          </div>
        )}
      </div>
    </>
  )

  const SearchHeader = () => (
    <div className="px-5 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          placeholder="Search users..."
          value={search}
          onChange={handleSearch}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
        />
      </div>
    </div>
  )

  // Chat panel content (shared mobile/desktop)
  const ChatContent = ({ isMobile = false }) => (
    selectedUser ? (
      <>
        <div className="flex items-center gap-3 px-3 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
          {isMobile && (
            <button onClick={() => setView("sidebar")} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <img src={avatarSrc(selectedUser)} onError={e => avatarErr(e, selectedUser)} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt={selectedUser.username} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{selectedUser.username}</p>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-4">
          {messages.map((m, i) => {
            // 🔥 FIX: toString() comparison
            const isMine = (m.sender?._id || m.sender || "").toString() === userId?.toString()
            const senderUser = isMine ? me : selectedUser
            const isLastInGroup = i === messages.length - 1 || (messages[i + 1]?.sender?._id || messages[i + 1]?.sender || "").toString() !== (m.sender?._id || m.sender || "").toString()
            return <MessageBubble key={m._id || i} m={m} isMine={isMine} senderUser={senderUser} isLastInGroup={isLastInGroup} />
          })}
          <div ref={messagesEndRef} />
        </div>

        <SharedPreview />
        <InputBar px={isMobile ? "px-3" : "px-4"} />
      </>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3 p-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <p className="text-gray-400 font-semibold">Select a chat</p>
        {!isMobile && <p className="text-gray-300 text-sm text-center">Choose a conversation or search for a user</p>}
      </div>
    )
  )

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex-1 md:ml-64 h-screen overflow-hidden">

        {/* MOBILE */}
        <div className="flex h-full md:hidden">
          <div className={`flex flex-col bg-white h-full w-full border-r border-gray-200 ${view === "sidebar" ? "flex" : "hidden"}`}>
            <SearchHeader />
            <SidebarContent />
          </div>
          <div className={`flex flex-col bg-gray-50 w-full h-[calc(100dvh-64px)] ${view === "chat" ? "flex" : "hidden"}`}>
            <ChatContent isMobile={true} />
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex h-full">
          <div className="w-80 flex-shrink-0 h-full flex flex-col bg-white border-r border-gray-200">
            <SearchHeader />
            <SidebarContent />
          </div>
          <div className="flex-1 h-full min-w-0 flex flex-col bg-gray-50">
            <ChatContent isMobile={false} />
          </div>
        </div>

      </div>
    </div>
  )
}