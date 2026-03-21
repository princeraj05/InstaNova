import Story from "../models/Story.js"

// ➕ CREATE STORY
export const createStory = async (req, res) => {
  try {
    const story = await Story.create({
      user: req.userId,
      media: req.file.path
    })

    res.json(story)
  } catch (err) {
    res.status(500).json(err)
  }
}

// 📥 GET STORIES
export const getStories = async (req, res) => {
  try {
    const stories = await Story.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })

    res.json(stories)
  } catch (err) {
    res.status(500).json(err)
  }
}