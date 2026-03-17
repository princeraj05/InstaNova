import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"

export default function Messages(){

  const userId = localStorage.getItem("userId")

  const [message,setMessage] = useState("")
  const [messages,setMessages] = useState([])
  const [search,setSearch] = useState("")
  const [users,setUsers] = useState([])
  const [selectedUser,setSelectedUser] = useState(null)
  const [conversation,setConversation] = useState(null)

  // 🔍 search users
  const handleSearch = async () => {
    try{
      const res = await API.get(`/api/search?query=${search}`)
      setUsers(res.data)
    }catch(err){
      console.log(err)
    }
  }

  // 👤 select user + create/get conversation
  const selectUser = async (user) => {
    setSelectedUser(user)

    try{
      // create conversation
      const res = await API.post("/api/conversations", {
        senderId: userId,
        receiverId: user._id
      })

      setConversation(res.data)

      // get old messages
      const msgs = await API.get(`/api/messages/${res.data._id}`)
      setMessages(msgs.data)

    }catch(err){
      console.log(err)
    }
  }

  // 📩 send message
  const sendMessage = async () => {

    if(!message || !conversation) return

    const newMsg = {
      conversationId: conversation._id,
      sender: userId,
      text: message
    }

    try{
      await API.post("/api/messages", newMsg)

      setMessages(prev => [...prev,newMsg])
      setMessage("")

    }catch(err){
      console.log(err)
    }
  }

  return(
    <div style={{display:"flex"}}>

      <Navbar/>

      <div style={{marginLeft:"250px",padding:"40px", width:"100%"}}>

        <h2>Messages</h2>

        {/* 🔍 SEARCH */}
        <input
          placeholder="Search user..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>

        {/* 👤 USER LIST */}
        {users.map(u=>(
          <p key={u._id} onClick={()=>selectUser(u)} style={{cursor:"pointer"}}>
            {u.username}
          </p>
        ))}

        <hr/>

        {/* 💬 CHAT */}
        <h3>
          {selectedUser ? `Chat with ${selectedUser.username}` : "Select user"}
        </h3>

        {messages.map((m,i)=>(
          <p key={i}>
            <b>{m.sender === userId ? "Me" : "Them"}:</b> {m.text}
          </p>
        ))}

        {selectedUser && (
          <>
            <input
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </>
        )}

      </div>

    </div>
  )
}