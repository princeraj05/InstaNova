import { useState, useEffect, useRef } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { io } from "socket.io-client"

export default function Messages() {

  const userId = localStorage.getItem("userId")

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [conversationUsers, setConversationUsers] = useState({})

  const socket = useRef()
  const messagesEndRef = useRef()

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // socket
  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SERVER_URL, {
      transports: ["websocket"]
    })

    socket.current.emit("addUser", userId)

    socket.current.on("newMessage", (data) => {
      if (data.conversationId === conversation?._id) {
        setMessages(prev => [...prev, data])
      }
    })

    return () => socket.current.disconnect()
  }, [conversation])

  // conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const res = await API.get(`/conversations/${userId}`)
      setConversations(res.data)

      const userMap = {}
      await Promise.all(
        res.data.map(async (conv) => {
          const friendId = conv.members.find(id => id !== userId)
          if (friendId && !userMap[friendId]) {
            try {
              const userRes = await API.get(`/user/${friendId}`)
              userMap[friendId] = userRes.data
            } catch {
              userMap[friendId] = { username: "Unknown" }
            }
          }
        })
      )
      setConversationUsers(userMap)
    }
    fetchConversations()
  }, [])

  // search
  const handleSearch = async (e) => {
    const value = e.target.value
    setSearch(value)

    if (value.length > 0) {
      try {
        const res = await API.get(`/search?username=${value}`)
        setUsers(res.data)
      } catch {
        setUsers([])
      }
    } else setUsers([])
  }

  const selectUser = async (user) => {
    setSelectedUser(user)

    const res = await API.post("/conversations", {
      senderId: userId,
      receiverId: user._id
    })

    setConversation(res.data)

    const msgs = await API.get(`/messages/${res.data._id}`)
    setMessages(msgs.data)

    setSearch("")
    setUsers([])
  }

  const openConversation = async (conv) => {
    const friendId = conv.members.find(id => id !== userId)
    const resUser = await API.get(`/user/${friendId}`)

    setSelectedUser(resUser.data)
    setConversation(conv)

    const msgs = await API.get(`/messages/${conv._id}`)
    setMessages(msgs.data)
  }

  const sendMessage = async () => {
    if (!message.trim() || !conversation) return

    const newMsg = {
      conversationId: conversation._id,
      sender: userId,
      text: message
    }

    await API.post("/messages", newMsg)

    socket.current.emit("sendMessage", {
      senderId: userId,
      receiverId: selectedUser._id,
      text: message
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}`
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex w-full md:ml-64 h-screen overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-[320px] min-w-[260px] bg-white border-r shadow-sm flex flex-col">

          {/* Header */}
          <div className="p-5 pb-3 border-b">
            <h2 className="text-xl font-bold mb-3">Messages</h2>

            <div className="relative">
              <input
                placeholder="Search users..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm outline-none"
              />
            </div>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto">

            {/* SEARCH */}
            {users.length > 0 && (
              <div className="py-2">
                <p className="text-xs font-semibold text-gray-400 px-4 uppercase">Search</p>

                {users.map(u => (
                  <div
                    key={u._id}
                    onClick={() => selectUser(u)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <img src={getAvatar(u)} className="w-10 h-10 rounded-full" />
                    <p className="font-semibold text-sm">{u.username}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CONVERSATIONS */}
            {search === "" && conversations.map(c => {
              const friendId = c.members.find(id => id !== userId)
              const friend = conversationUsers[friendId]

              return (
                <div
                  key={c._id}
                  onClick={() => openConversation(c)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <img src={getAvatar(friend)} className="w-11 h-11 rounded-full" />
                  <p className="font-semibold text-sm">{friend?.username}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col">

          {selectedUser ? (
            <>
              {/* HEADER */}
              <div className="flex items-center gap-3 p-4 bg-white border-b shadow-sm">
                <img src={getAvatar(selectedUser)} className="w-10 h-10 rounded-full" />
                <p className="font-bold">{selectedUser.username}</p>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2 bg-gray-50">
                {messages.map((m, i) => {
                  const isMine = m.sender === userId

                  return (
                    <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`px-4 py-2 rounded-2xl text-sm max-w-[65%]
                        ${isMine
                          ? "bg-indigo-500 text-white"
                          : "bg-white text-gray-800 shadow"}`}>
                        {m.text}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div className="p-3 bg-white border-t flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border rounded-full px-4 py-2 text-sm outline-none"
                  placeholder="Type message..."
                />

                <button
                  onClick={sendMessage}
                  className="w-11 h-11 rounded-full bg-indigo-500 text-white"
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a chat
            </div>
          )}
        </div>
      </div>
    </div>
  )
}