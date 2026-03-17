import Conversation from "../models/Conversation.js"

// 💬 CREATE OR GET CONVERSATION
export const createConversation = async (req, res) => {
  try {

    const { senderId, receiverId } = req.body

    // ❌ validation
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Missing user IDs" })
    }

    // 🔥 CHECK EXISTING CONVERSATION
    const existing = await Conversation.findOne({
      members: { $all: [senderId, receiverId] }
    })

    if (existing) {
      return res.json(existing) // ✅ reuse old
    }

    // 🆕 CREATE NEW
    const newConv = new Conversation({
      members: [senderId, receiverId]
    })

    const saved = await newConv.save()

    res.json(saved)

  } catch (err) {
    console.log("Conversation Error:", err)
    res.status(500).json({ message: "Conversation failed" })
  }
}


// 🔥 ADD THIS (ONLY NEW CODE)
export const getConversations = async (req, res) => {
  try {

    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] }
    })

    res.json(conversations)

  } catch (err) {
    res.status(500).json(err)
  }
}