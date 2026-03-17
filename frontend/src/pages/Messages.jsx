import { useState } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"

export default function Messages(){

  const userId = localStorage.getItem("userId")

  const [message,setMessage] = useState("")
  const [messages,setMessages] = useState([])

  const sendMessage = async () => {

    if(!message) return

    const newMsg = {
      conversationId:"test",
      sender:userId,
      text:message
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