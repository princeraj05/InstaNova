import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import io from "socket.io-client"

const socket = io(import.meta.env.VITE_SERVER_URL)

export default function Messages(){

  const userId = localStorage.getItem("userId")

  const [message,setMessage] = useState("")
  const [messages,setMessages] = useState([])

  useEffect(()=>{
    socket.emit("addUser", userId)

    socket.on("getMessage",(data)=>{
      setMessages(prev => [...prev, data])
    })
  },[])

  const sendMessage = async () => {

    const newMsg = {
      conversationId:"test",
      sender:userId,
      text:message
    }

    await API.post("/messages", newMsg)

    socket.emit("sendMessage", {
      senderId:userId,
      receiverId:"TARGET_USER_ID",
      text:message
    })

    setMessages([...messages,newMsg])
    setMessage("")
  }

  return(
    <div style={{display:"flex"}}>

      <Navbar/>

      <div style={{marginLeft:"250px",padding:"40px"}}>

        <h2>Messages</h2>

        {messages.map((m,i)=>(
          <p key={i}>{m.text}</p>
        ))}

        <input
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>
  )
}