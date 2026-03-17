import Conversation from "../models/Conversation.js"

// create conversation
export const createConversation = async (req, res) => {
  try {
    const newConv = new Conversation({
      members: [req.body.senderId, req.body.receiverId]
    })

    const saved = await newConv.save()
    res.json(saved)
  } catch (err) {
    res.status(500).json(err)
  }
}

// get user conversations
export const getConversations = async (req, res) => {
  try {
    const convs = await Conversation.find({
      members: { $in: [req.params.userId] }
    })
    res.json(convs)
  } catch (err) {
    res.status(500).json(err)
  }
}