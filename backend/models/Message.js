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

  // 🔥 ADD THIS
  reel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }

}, { timestamps: true })

export default mongoose.model("Message", messageSchema)