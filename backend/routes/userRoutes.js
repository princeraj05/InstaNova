import express from "express"
import multer from "multer"

import {
getProfile,
updateProfile,
followUser,
unfollowUser
} from "../controllers/userController.js"

const router = express.Router()

// multer storage
const storage = multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"uploads/")
},
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

// routes
router.get("/:id",getProfile)

router.put("/:id",upload.single("profilePic"),updateProfile)

router.put("/follow/:id",followUser)

router.put("/unfollow/:id",unfollowUser)

export default router