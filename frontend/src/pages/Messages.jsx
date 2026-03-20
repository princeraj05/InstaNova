import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import Navbar from "../components/Navbar"
import API from "../api/axios"
import { io } from "socket.io-client"

export default function Messages() {

  const location = useLocation()
  const navigate = useNavigate()   // 🔥 ADD
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
    if (!conversation) return

    const { data } = await API.post("/messages", {
      conversationId: conversation._id,
      sender: userId,
      text: message,
      reel: sharedReel?._id
    })

    setMessages(prev => [...prev, data])

    socket.current.emit("sendMessage", {
      senderId: userId,
      receiverId: selectedUser._id,
      text: message,
      conversationId: conversation._id
    })

    setMessage("")
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

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Navbar />

      <div className="flex-1 md:ml-64 h-screen overflow-hidden relative">
        <div className="flex h-full relative overflow-hidden">

          {/* LEFT */}
          <div className={`flex flex-col bg-white border-r border-gray-100 shadow-sm
            md:w-80 absolute inset-0 z-10 w-full
            ${showChat ? "-translate-x-full" : "translate-x-0"}`}>

            <div className="px-4 pt-5 pb-3 border-b">
              <h2 className="text-xl font-bold mb-3">Messages</h2>
              <input
                placeholder="Search users..."
                value={search}
                onChange={handleSearch}
                className="w-full px-3 py-2 bg-gray-100 rounded-full text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {users.map(u => (
                <div key={u._id} onClick={() => selectUser(u)}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50">
                  <img src={getAvatar(u)} className="w-10 h-10 rounded-full" />
                  <p>{u.username}</p>
                </div>
              ))}

              {search === "" && conversations.map(c => {
                const friendId = c.members.find(id => id !== userId)
                const friend = conversationUsers[friendId]
                return (
                  <div key={c._id} onClick={() => openConversation(c)}
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50">
                    <img src={getAvatar(friend)} className="w-10 h-10 rounded-full" />
                    <p>{friend?.username}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className={`flex flex-col flex-1 ${showChat ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}>

            {selectedUser ? (
              <>
                <div className="p-3 bg-white border-b">
                  <p className="font-bold">{selectedUser.username}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                  {messages.map((m, i) => {
                    const isMine = m.sender === userId
                    return (
                      <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`p-2 rounded-lg ${isMine ? "bg-indigo-500 text-white" : "bg-white"}`}>

                          {m.text && <p>{m.text}</p>}

                          {/* 🔥 CLICKABLE REEL */}
                          {m.reel && (
                            <div
                              onClick={() => navigate(`/reels?reelId=${m.reel._id}`)}
                              className="mt-2 cursor-pointer"
                            >
                              <video
                                src={m.reel.media}
                                className="rounded-lg max-h-60"
                              />
                              <p className="text-xs text-blue-500 mt-1">Open Reel</p>
                            </div>
                          )}

                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex p-3 bg-white border-t">
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border px-3 py-2 rounded-full"
                  />
                  <button onClick={sendMessage} className="ml-2 px-4 bg-indigo-500 text-white rounded-full">
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p>Select chat</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}