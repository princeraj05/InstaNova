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

  // 🔍 LIVE SEARCH
  const handleSearch = async(e)=>{
    const value = e.target.value
    setSearch(value)

    if(value.length > 0){
      try{
        const res = await API.get(`/search?username=${value}`)
        setUsers(res.data)
      }catch(err){
        console.log(err)
        setUsers([])
      }
    }else{
      setUsers([])
    }
  }

  // 👤 SELECT USER
  const selectUser = async(user)=>{
    setSelectedUser(user)

    try{
      const res = await API.post("/conversations",{
        senderId:userId,
        receiverId:user._id
      })

      setConversation(res.data)

      const msgs = await API.get(`/messages/${res.data._id}`)
      setMessages(msgs.data)

    }catch(err){
      console.log(err)
    }
  }

  // 🔄 AUTO REFRESH MESSAGES (🔥 MAIN FIX)
  useEffect(()=>{
    if(!conversation) return

    const interval = setInterval(async ()=>{
      try{
        const res = await API.get(`/messages/${conversation._id}`)
        setMessages(res.data)
      }catch(err){
        console.log(err)
      }
    }, 2000) // every 2 sec

    return ()=>clearInterval(interval)

  },[conversation])

  // 📩 SEND MESSAGE
  const sendMessage = async()=>{
    if(!message || !conversation) return

    const newMsg = {
      conversationId: conversation._id,
      sender: userId,
      text: message
    }

    try{
      await API.post("/messages", newMsg)

      setMessages(prev => [...prev,newMsg])
      setMessage("")

    }catch(err){
      console.log(err)
    }
  }

  return(
    <div className="flex min-h-screen bg-gray-100">

      <Navbar/>

      <div className="w-full md:ml-64 flex">

        {/* LEFT PANEL */}
        <div className="w-1/3 border-r p-4 bg-white">

          <h2 className="text-xl font-bold mb-4">Messages</h2>

          <input
            placeholder="Search user..."
            value={search}
            onChange={handleSearch}
            className="w-full border p-2 rounded mb-4"
          />

          {users.map(u=>(
            <div
              key={u._id}
              onClick={()=>selectUser(u)}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded"
            >
              {u.username}
            </div>
          ))}

        </div>

        {/* RIGHT CHAT */}
        <div className="w-2/3 p-6">

          {selectedUser ? (
            <>
              <h3 className="text-lg font-semibold mb-4">
                Chat with {selectedUser.username}
              </h3>

              <div className="h-[400px] overflow-y-auto border p-3 rounded bg-white">

                {messages.map((m,i)=>(
                  <div
                    key={i}
                    className={`mb-2 ${
                      m.sender === userId ? "text-right" : "text-left"
                    }`}
                  >
                    <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded">
                      {m.text}
                    </span>
                  </div>
                ))}

              </div>

              <div className="flex mt-4 gap-2">
                <input
                  value={message}
                  onChange={(e)=>setMessage(e.target.value)}
                  className="flex-1 border p-2 rounded"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white px-4 rounded"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p>Select user to start chat</p>
          )}

        </div>

      </div>

    </div>
  )
}