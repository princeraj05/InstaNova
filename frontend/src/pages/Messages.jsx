import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import Navbar from "../components/Navbar"
import API from "../api/axios"
import { io } from "socket.io-client"

export default function Messages() {

  const location = useLocation()
  const navigate = useNavigate()
  const sharedReel = location.state?.shareReel

  const userId = localStorage.getItem("userId")

  const [message, setMessage] = useState(
    sharedReel ? "📤 Shared a reel" : ""
  )

  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [conversationUsers, setConversationUsers] = useState({})
  const [showChat, setShowChat] = useState(false)
  const [sending, setSending] = useState(false)  // 🔥 FIX: prevent double send

  const socket = useRef()
  const messagesEndRef = useRef()
  const conversationRef = useRef()  // 🔥 FIX: stable ref for socket listener

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 🔥 FIX: Keep conversationRef in sync so socket always sees latest conversation
  useEffect(() => {
    conversationRef.current = conversation
  }, [conversation])

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SERVER_URL, { transports: ["websocket"] })
    socket.current.emit("addUser", userId)

    socket.current.on("newMessage", (data) => {
      // Use ref instead of stale closure value
      if (data.conversationId === conversationRef.current?._id) {
        setMessages(prev => {
          // 🔥 FIX: Deduplicate - don't add if same _id already exists
          const alreadyExists = prev.some(m => m._id === data._id)
          if (alreadyExists) return prev
          return [...prev, data]
        })
      }
    })

    return () => { socket.current.disconnect() }
  }, [])  // 🔥 FIX: Run only once, not on every conversation change

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
        await Promise.all(
          unique.map(async (conv) => {
            const friendId = conv.members.find(id => id !== userId)
            if (friendId) {
              try {
                const userRes = await API.get(`/user/${friendId}`)
                userMap[friendId] = userRes.data
              } catch {
                userMap[friendId] = { username: "Unknown", profilePic: null }
              }
            }
          })
        )
        setConversationUsers(userMap)
      } catch (err) { console.log(err) }
    }
    fetchConversations()
  }, [])

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearch(value)
    if (value.length > 0) {
      try {
        const res = await API.get(`/search?username=${value}`)
        setUsers(res.data)
      } catch { setUsers([]) }
    } else { setUsers([]) }
  }

  const selectUser = async (user) => {
    setSelectedUser(user)
    const res = await API.post("/conversations", { senderId: userId, receiverId: user._id })
    setConversation(res.data)
    const msgs = await API.get(`/messages/${res.data._id}`)
    setMessages(msgs.data)
    setSearch("")
    setUsers([])
    setShowChat(true)
  }

  const openConversation = async (conv) => {
    const friendId = conv.members.find(id => id !== userId)
    if (!friendId) return
    const resUser = await API.get(`/user/${friendId}`)
    setSelectedUser(resUser.data)
    setConversation(conv)
    const msgs = await API.get(`/messages/${conv._id}`)
    setMessages(msgs.data)
    setShowChat(true)
  }

  const sendMessage = async () => {
    if (!conversation || !message.trim() || sending) return  // 🔥 FIX: guard sending flag

    setSending(true)
    try {
      const { data } = await API.post("/messages", {
        conversationId: conversation._id,
        sender: userId,
        text: message,
        reel: sharedReel?._id
      })

      // 🔥 FIX: Add message only from API response (single source of truth)
      setMessages(prev => {
        const alreadyExists = prev.some(m => m._id === data._id)
        if (alreadyExists) return prev
        return [...prev, data]
      })

      socket.current.emit("sendMessage", {
        senderId: userId,
        receiverId: selectedUser._id,
        text: message,
        conversationId: conversation._id,
        _id: data._id  // 🔥 FIX: pass _id so receiver can deduplicate
      })

      setMessage("")
    } catch (err) {
      console.error("Send failed", err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getAvatar = (user) => {
    if (user?.profilePic) return user.profilePic
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=40`
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatConvTime = (dateStr) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" })
    return date.toLocaleDateString([], { day: "2-digit", month: "short" })
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />

      <div className="flex-1 md:ml-64 h-screen overflow-hidden">
        <div className="flex h-full">

          {/* ===== LEFT SIDEBAR ===== */}
          <div className={`
            flex flex-col bg-white border-r border-gray-200
            w-full md:w-80 md:flex-shrink-0
            absolute md:relative inset-0 z-10
            transition-transform duration-300
            ${showChat ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
          `}>

            {/* Header */}
            <div className="px-5 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* Search Results */}
            {users.length > 0 && (
              <div className="border-b border-gray-100">
                <p className="px-5 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Search Results</p>
                {users.map(u => (
                  <div key={u._id} onClick={() => selectUser(u)}
                    className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-indigo-50 transition-colors">
                    <img src={getAvatar(u)} className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-100" alt={u.username} />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{u.username}</p>
                      <p className="text-xs text-gray-400">Tap to message</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {search === "" && (
                <>
                  {conversations.length > 0 && (
                    <p className="px-5 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent</p>
                  )}
                  {conversations.map(c => {
                    const friendId = c.members.find(id => id !== userId)
                    const friend = conversationUsers[friendId]
                    return (
                      <div key={c._id} onClick={() => openConversation(c)}
                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-indigo-50 transition-colors
                          ${conversation?._id === c._id ? "bg-indigo-50 border-r-2 border-indigo-500" : ""}`}>
                        <div className="relative flex-shrink-0">
                          <img src={getAvatar(friend)} className="w-12 h-12 rounded-full object-cover" alt={friend?.username} />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800 text-sm truncate">{friend?.username}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {formatConvTime(c.updatedAt || c.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">Tap to open chat</p>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}

              {search === "" && conversations.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-gray-300 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-sm">No conversations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT CHAT PANEL ===== */}
          <div className={`
            flex flex-col flex-1
            absolute md:relative inset-0 z-10
            bg-gray-50
            transition-transform duration-300
            ${showChat ? "translate-x-0" : "translate-x-full md:translate-x-0"}
          `}>

            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
                  {/* Back button mobile */}
                  <button onClick={() => setShowChat(false)}
                    className="md:hidden p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <img src={getAvatar(selectedUser)} className="w-10 h-10 rounded-full object-cover" alt={selectedUser.username} />
                  <div>
                    <p className="font-bold text-gray-900">{selectedUser.username}</p>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                  {messages.map((m, i) => {
                    const isMine = m.sender === userId
                    const showTime = i === messages.length - 1 ||
                      messages[i + 1]?.sender !== m.sender

                    return (
                      <div key={m._id || i} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                        <div className={`max-w-xs md:max-w-sm lg:max-w-md rounded-2xl overflow-hidden shadow-sm
                          ${isMine
                            ? "bg-indigo-500 text-white rounded-br-sm"
                            : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                          }`}>

                          {/* Text */}
                          {m.text && (
                            <p className="px-4 py-2.5 text-sm leading-relaxed">{m.text}</p>
                          )}

                          {/* 🔥 Reel Preview - properly shown */}
                          {m.reel && (
                            <div
                              onClick={() => navigate(`/reels?reelId=${m.reel._id || m.reel}`)}
                              className="cursor-pointer group"
                            >
                              {m.reel.media ? (
                                <div className="relative">
                                  <video
                                    src={m.reel.media}
                                    className="w-full max-h-64 object-cover"
                                    muted
                                    playsInline
                                  />
                                  {/* Play overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
                                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* Fallback if reel only has ID, not populated */
                                <div className={`mx-3 mb-2 mt-1 rounded-xl flex items-center gap-2 px-3 py-2
                                  ${isMine ? "bg-white/20" : "bg-indigo-50 border border-indigo-100"}`}>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                    ${isMine ? "bg-white/30" : "bg-indigo-500"}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${isMine ? "text-white" : "text-white"}`} fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                  <p className={`text-xs font-medium ${isMine ? "text-white" : "text-indigo-600"}`}>View Reel</p>
                                </div>
                              )}
                              <p className={`text-xs px-3 pb-2 pt-1 ${isMine ? "text-indigo-200" : "text-indigo-500"}`}>
                                🎬 Tap to open reel
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        {showTime && (
                          <span className="text-xs text-gray-400 mt-1 px-1">
                            {formatTime(m.createdAt)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Shared Reel Preview Banner */}
                {sharedReel && (
                  <div className="mx-4 mb-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-indigo-700">Sharing a Reel</p>
                      <p className="text-xs text-indigo-400 truncate">{sharedReel.caption || "Reel"}</p>
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100">
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message..."
                    className="flex-1 border border-gray-200 px-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 transition"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !message.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-sm font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </button>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-gray-400 font-medium">Select a chat to start messaging</p>
                <p className="text-gray-300 text-sm">Search users above to start a new conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}