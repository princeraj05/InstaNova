import { useState, useEffect, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { io } from "socket.io-client"

export default function Messages() {
  

 const location = useLocation()
  const sharedReel = location.state?.shareReel

  const userId = localStorage.getItem("userId")

  const [message, setMessage] = useState(
    sharedReel ? `Check out this reel: ${sharedReel.media}` : ""
  )

  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [conversationUsers, setConversationUsers] = useState({})
  const [showChat, setShowChat] = useState(false)

  const socket = useRef()
  const messagesEndRef = useRef()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SERVER_URL, { transports: ["websocket"] })
    socket.current.emit("addUser", userId)
    socket.current.on("newMessage", (data) => {
      if (data.conversationId === conversation?._id) {
        setMessages(prev => [...prev, data])
      }
    })
    return () => { socket.current.disconnect() }
  }, [conversation])

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
    if (!message.trim() || !conversation) return
    await API.post("/messages", { conversationId: conversation._id, sender: userId, text: message })
    socket.current.emit("sendMessage", { senderId: userId, receiverId: selectedUser._id, text: message })
    setMessage("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const getAvatar = (user) => {
    if (user?.profilePic) return user.profilePic
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=6366f1&color=fff&size=40`
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Navbar />

      {/* Main area: on desktop offset by sidebar width, on mobile full width */}
      {/* pb-16 on mobile so content doesn't hide behind bottom navbar */}
      <div className="flex-1 md:ml-64 h-screen overflow-hidden relative">

        <div className="flex h-full relative overflow-hidden">

          {/* ── LEFT PANEL ── */}
          <div
            className={`
              flex flex-col bg-white border-r border-gray-100 shadow-sm
              transition-transform duration-300 ease-in-out
              md:static md:translate-x-0 md:w-80 md:min-w-[260px]
              absolute inset-0 z-10 w-full
              ${showChat ? "-translate-x-full" : "translate-x-0"}
            `}
          >
            {/* Header */}
            <div className="px-4 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  placeholder="Search users..."
                  value={search}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
              </div>
            </div>

            {/* List */}
            {/* pb-16 so last item not hidden by mobile bottom navbar */}
            <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
              {users.length > 0 && (
                <div className="py-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-1">Search Results</p>
                  {users.map(u => (
                    <div key={u._id} onClick={() => selectUser(u)}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition">
                      <img src={getAvatar(u)} alt={u.username}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-800">{u.username}</p>
                    </div>
                  ))}
                </div>
              )}

              {search === "" && (
                <div className="py-2">
                  {conversations.length > 0 && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-1">Recent Chats</p>
                  )}
                  {conversations.map(c => {
                    const friendId = c.members.find(id => id !== userId)
                    const friend = conversationUsers[friendId]
                    const isActive = conversation?._id === c._id
                    return (
                      <div key={c._id} onClick={() => openConversation(c)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition border-l-[3px]
                          ${isActive ? "bg-indigo-50 border-indigo-500" : "border-transparent hover:bg-gray-50"}`}>
                        <img src={getAvatar(friend)} alt={friend?.username || "User"}
                          className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-gray-200" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-gray-800 truncate">{friend?.username || "..."}</p>
                          <p className="text-xs text-gray-400">Tap to open chat</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div
            className={`
              flex flex-col flex-1 overflow-hidden
              transition-transform duration-300 ease-in-out
              md:static md:translate-x-0
              absolute inset-0 z-20
              ${showChat ? "translate-x-0" : "translate-x-full"}
            `}
          >
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
                  {/* Back button - only on mobile */}
                  <button
                    onClick={() => setShowChat(false)}
                    className="md:hidden text-indigo-500 p-1 flex items-center"
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M19 12H5M5 12l7-7M5 12l7 7" />
                    </svg>
                  </button>
                  <div className="relative">
                    <img src={getAvatar(selectedUser)} alt={selectedUser.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                    <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedUser.username}</p>
                    <p className="text-xs text-green-500 font-medium">Online</p>
                  </div>
                </div>

                {/* Messages */}
                {/* pb-16 on mobile so input doesn't hide behind bottom navbar */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 bg-gray-50 pb-16 md:pb-4">
                  {messages.map((m, i) => {
                    const isMine = m.sender === userId
                    return (
                      <div key={i}
                        className={`flex items-end gap-2 mb-1 ${isMine ? "justify-end" : "justify-start"}`}>
                        {!isMine && (
                          <img src={getAvatar(selectedUser)} alt={selectedUser.username}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                        )}
                        <div className="max-w-[65%]">
                          {!isMine && (
                            <p className="text-[11px] text-gray-400 font-medium mb-0.5 pl-0.5">{selectedUser.username}</p>
                          )}
                          <div className={`px-3.5 py-2.5 text-sm leading-snug
                            ${isMine
                              ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-[18px_18px_4px_18px] shadow-md shadow-indigo-200"
                              : "bg-white text-gray-800 rounded-[18px_18px_18px_4px] shadow-sm"
                            }`}>
                            {m.text}
                          </div>
                        </div>
                        {isMine && <div className="w-7 flex-shrink-0" />}
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input — fixed above mobile bottom navbar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0 mb-16 md:mb-0">
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedUser.username}...`}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm outline-none bg-gray-50
                      focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition
                      ${message.trim()
                        ? "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200 cursor-pointer"
                        : "bg-gray-200 cursor-not-allowed"
                      }`}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-200">
                  <svg width="34" height="34" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">Your Messages</p>
                  <p className="text-sm text-gray-400 mt-1">Search a user or select a chat to begin</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}