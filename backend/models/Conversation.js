import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema({
  members: {
    type: Array, // [user1, user2]
  },
}, { timestamps: true })

export default mongoose.model("Conversation", conversationSchema)