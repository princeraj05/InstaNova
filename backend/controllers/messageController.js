import Message from "../models/Message.js"

// send message
export const sendMessage = async (req, res) => {
  try {
    const newMessage = new Message(req.body)
    const savedMessage = await newMessage.save()
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