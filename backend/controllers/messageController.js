import Message from "../models/Message.js"
import { io } from "../server.js"

// ==============================
// SEND MESSAGE
// ==============================
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, sender, text, reel, post } = req.body

    const newMessage = new Message({
      conversationId,
      sender,
      text,
      reel: reel || null,
      post: post || null   // 🔥 post share
    })

    const savedMessage = await newMessage.save()

    // 🔥 populate reel + post (with nested user)
    const populated = await Message.findById(savedMessage._id)
      .populate("reel", "media caption user")
      .populate({
        path: "post",
        select: "media caption mediaType user",
        populate: { path: "user", select: "username profilePic" }
      })

    io.emit("newMessage", populated)

    res.json(populated)

  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

// ==============================
// GET MESSAGES
// ==============================
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
      .populate("reel", "media caption user")
      .populate({
        path: "post",
        select: "media caption mediaType user",
        populate: { path: "user", select: "username profilePic" }
      })
      .sort({ createdAt: 1 })

    res.json(messages)

  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}