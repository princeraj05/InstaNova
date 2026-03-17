import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js"

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "instagram-clone",
    resource_type: "auto" // image + video
  }
})

const upload = multer({ storage })

export default upload