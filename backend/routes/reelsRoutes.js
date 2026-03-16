import express from "express"
import {getReels} from "../controllers/reelsController.js"

const router = express.Router()

router.get("/",getReels)

export default router