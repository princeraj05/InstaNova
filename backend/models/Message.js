import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  text: {
    type: String
  },
  // 🔥 Reel share
  reel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null
  },
  // 🔥 Post share
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null
  }

}, { timestamps: true })

export default mongoose.model("Message", messageSchema)