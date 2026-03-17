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

        // FIX 1: Remove duplicate friendIds
        const seen = new Set()
        const unique = []
        for (const conv of res.data) {
          const friendId = conv.members.find(id => id !== userId)
          // FIX 2: Skip undefined friendId (causes /user/undefined 500 error)
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
      } catch (err) {
        console.log(err)
      }
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
    <>
      <style>{`
        .msgs-wrapper { display: flex; width: 100%; height: 100%; overflow: hidden; position: relative; }
        .left-panel {
          width: 320px; min-width: 260px; flex-shrink: 0;
          display: flex; flex-direction: column;
          background: #fff; border-right: 1px solid #f0f0f0;
          box-shadow: 2px 0 8px rgba(0,0,0,0.06);
          transition: transform 0.3s ease;
        }
        .right-panel {
          flex: 1; display: flex; flex-direction: column; overflow: hidden;
          transition: transform 0.3s ease;
        }
        .back-btn { display: none !important; }

        @media (max-width: 768px) {
          .left-panel {
            position: absolute; inset: 0; z-index: 10; width: 100%; min-width: unset;
          }
          .left-panel.mobile-hide { transform: translateX(-100%); }
          .right-panel {
            position: absolute; inset: 0; z-index: 20;
            transform: translateX(100%);
          }
          .right-panel.mobile-show { transform: translateX(0); }
          .back-btn { display: flex !important; }
        }
      `}</style>

      <div className="flex min-h-screen" style={{ background: "#f0f2f5" }}>
        <Navbar />
        <div className="w-full md:ml-64" style={{ height: "100vh", overflow: "hidden" }}>
          <div className="msgs-wrapper">

            {/* LEFT PANEL */}
            <div className={`left-panel${showChat ? " mobile-hide" : ""}`}>
              <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #f0f0f0" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f0f0f", marginBottom: "12px" }}>Messages</h2>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
                    width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    placeholder="Search users..."
                    value={search}
                    onChange={handleSearch}
                    style={{
                      width: "100%", padding: "9px 12px 9px 34px",
                      border: "none", borderRadius: "20px", background: "#f3f4f6",
                      fontSize: "14px", outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {users.length > 0 && (
                  <div style={{ padding: "8px 0" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", padding: "4px 16px 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Search Results
                    </p>
                    {users.map(u => (
                      <div key={u._id} onClick={() => selectUser(u)}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <img src={getAvatar(u)} alt={u.username}
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{u.username}</p>
                      </div>
                    ))}
                  </div>
                )}

                {search === "" && (
                  <div style={{ padding: "8px 0" }}>
                    {conversations.length > 0 && (
                      <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", padding: "4px 16px 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Recent Chats
                      </p>
                    )}
                    {conversations.map(c => {
                      const friendId = c.members.find(id => id !== userId)
                      const friend = conversationUsers[friendId]
                      const isActive = conversation?._id === c._id
                      return (
                        <div key={c._id} onClick={() => openConversation(c)}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 16px", cursor: "pointer", transition: "background 0.15s",
                            background: isActive ? "#eef2ff" : "transparent",
                            borderLeft: isActive ? "3px solid #6366f1" : "3px solid transparent"
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9fafb" }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}>
                          <img src={getAvatar(friend)} alt={friend?.username || "User"}
                            style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e5e7eb" }} />
                          <div style={{ overflow: "hidden" }}>
                            <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {friend?.username || "..."}
                            </p>
                            <p style={{ fontSize: "12px", color: "#9ca3af" }}>Tap to open chat</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className={`right-panel${showChat ? " mobile-show" : ""}`}>
              {selectedUser ? (
                <>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px", background: "#ffffff",
                    borderBottom: "1px solid #f0f0f0", boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
                  }}>
                    <button className="back-btn" onClick={() => setShowChat(false)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", alignItems: "center", color: "#6366f1" }}>
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M19 12H5M5 12l7-7M5 12l7 7" />
                      </svg>
                    </button>
                    <div style={{ position: "relative" }}>
                      <img src={getAvatar(selectedUser)} alt={selectedUser.username}
                        style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" }} />
                      <span style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", border: "2px solid white" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>{selectedUser.username}</p>
                      <p style={{ fontSize: "12px", color: "#22c55e", fontWeight: "500" }}>Online</p>
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "4px", background: "#f8f9fa" }}>
                    {messages.map((m, i) => {
                      const isMine = m.sender === userId
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px", marginBottom: "4px" }}>
                          {!isMine && (
                            <img src={getAvatar(selectedUser)} alt={selectedUser.username}
                              style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }} />
                          )}
                          <div style={{ maxWidth: "65%" }}>
                            {!isMine && (
                              <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px", paddingLeft: "2px", fontWeight: "500" }}>
                                {selectedUser.username}
                              </p>
                            )}
                            <div style={{
                              padding: "10px 14px",
                              borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                              background: isMine ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#ffffff",
                              color: isMine ? "#ffffff" : "#111827",
                              fontSize: "14px", lineHeight: "1.4",
                              boxShadow: isMine ? "0 2px 8px rgba(99,102,241,0.3)" : "0 1px 4px rgba(0,0,0,0.08)"
                            }}>
                              {m.text}
                            </div>
                          </div>
                          {isMine && <div style={{ width: "28px", flexShrink: 0 }} />}
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div style={{ padding: "12px 16px", background: "#ffffff", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${selectedUser.username}...`}
                      style={{
                        flex: 1, padding: "11px 16px", border: "1px solid #e5e7eb",
                        borderRadius: "24px", fontSize: "14px", outline: "none", background: "#f9fafb"
                      }}
                      onFocus={e => e.target.style.borderColor = "#6366f1"}
                      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                    />
                    <button onClick={sendMessage} disabled={!message.trim()}
                      style={{
                        width: "44px", height: "44px", borderRadius: "50%", border: "none",
                        background: message.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e5e7eb",
                        color: "white", cursor: message.trim() ? "pointer" : "not-allowed",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        boxShadow: message.trim() ? "0 2px 8px rgba(99,102,241,0.4)" : "none"
                      }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8f9fa", gap: "16px" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
                    <svg width="36" height="36" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>Your Messages</p>
                    <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "6px" }}>Search a user or select a chat to begin</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}