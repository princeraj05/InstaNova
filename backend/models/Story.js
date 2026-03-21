import mongoose from "mongoose"

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  media: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 🔥 auto delete after 24hr
  }
})

export default mongoose.model("Story", storySchema)