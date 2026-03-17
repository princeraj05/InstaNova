import Message from "../models/Message.js"
import { io } from "../server.js" // 🔥 IMPORT SOCKET

// send message
export const sendMessage = async (req, res) => {
  try {

    const newMessage = new Message(req.body)
    const savedMessage = await newMessage.save()

    // 🔥 SOCKET EMIT (MAIN FIX)
    io.emit("newMessage", savedMessage)

    res.json(savedMessage)

  } catch (err) {
    res.status(500).json(err)
  }
}

// get messages
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
    res.json(messages)
  } catch (err) {
    res.status(500).json(err)
  }
}