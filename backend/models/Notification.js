import mongoose from "mongoose"   // ❗ MISSING THA

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  type: { 
    type: String, 
    enum: ["like", "comment", "follow", "post"],
    required: true 
  },

  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },

  message: { type: String },
  read: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
})

// ❗ THIS WAS MISSING (MAIN ERROR)
export default mongoose.model("Notification", notificationSchema)