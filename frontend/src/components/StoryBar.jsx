import { useEffect, useState, useRef } from "react"
import API from "../api/axios"
import StoryViewer from "./StoryViewer"

export default function StoryBar() {
  const [grouped, setGrouped] = useState({})
  const [selectedStories, setSelectedStories] = useState(null)
  const [index, setIndex] = useState(0)
  const [seenStories, setSeenStories] = useState([])
  const [uploading, setUploading] = useState(false)

  const storyInputRef = useRef(null)
  const me = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await API.get("/stories")

        const groupedStories = {}
        data.forEach((s) => {
          const uid = s.user._id || s.user
          if (!groupedStories[uid]) groupedStories[uid] = []
          groupedStories[uid].push(s)
        })

        setGrouped(groupedStories)
      } catch (err) {
        console.log(err)
      }
    }

    fetchStories()
  }, [])

  // 🔥 STORY UPLOAD
  const handleStoryUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("media", file)

      const { data } = await API.post("/stories", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      // Turant grouped state me add
      setGrouped(prev => {
        const updated = { ...prev }
        if (!updated[me._id]) updated[me._id] = []
        updated[me._id] = [data, ...updated[me._id]]
        return updated
      })

    } catch (err) {
      console.log(err)
      alert("Story upload failed")
    } finally {
      setUploading(false)
      // input reset karo taaki same file dobara select ho sake
      e.target.value = ""
    }
  }

  // My stories (already posted)
  const myStories = grouped[me._id] || []

  // Other users stories (excluding me)
  const otherStories = Object.entries(grouped).filter(([uid]) => uid !== me._id)

  return (
    <>
      <div className="flex gap-4 overflow-x-auto mb-5 pb-2 scrollbar-hide">

        {/* 🔥 YOUR STORY */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">

            {/* Click on pic = VIEW stories (if any) */}
            <div
              onClick={() => {
                if (myStories.length > 0) {
                  setSelectedStories(myStories)
                  setIndex(0)
                }
              }}
              className={`w-16 h-16 rounded-full p-[2px] transition
                ${myStories.length > 0
                  ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 cursor-pointer"
                  : "bg-gray-200 cursor-default"
                }`}
            >
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                <img
                  src={me?.profilePic || `https://ui-avatars.com/api/?name=${me?.username}`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* + button = UPLOAD new story */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                storyInputRef.current.click()
              }}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-full flex items-center justify-center border-2 border-white transition-colors z-10"
            >
              {uploading ? (
                <svg className="animate-spin w-2.5 h-2.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <span className="text-white text-xs font-bold leading-none">+</span>
              )}
            </button>
          </div>

          <p className="text-xs mt-1 text-gray-500 w-16 text-center truncate">
            {myStories.length > 0 ? `Your story` : "Add story"}
          </p>

          <input
            ref={storyInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleStoryUpload}
          />
        </div>

        {/* OTHER USERS STORIES */}
        {otherStories.map(([uid, userStories]) => {
          const first = userStories[0]
          const seen = seenStories.includes(uid)

          return (
            <div
              key={uid}
              className="flex flex-col items-center cursor-pointer shrink-0"
              onClick={() => {
                setSelectedStories(userStories)
                setIndex(0)
                setSeenStories(prev => [...new Set([...prev, uid])])
              }}
            >
              <div className={`w-16 h-16 rounded-full p-[2px] ${seen ? "bg-gray-300" : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"}`}>
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                  <img
                    src={first.user?.profilePic || `https://ui-avatars.com/api/?name=${first.user?.username}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <p className="text-xs mt-1 text-gray-700 w-16 text-center truncate">
                {first.user?.username}
              </p>
            </div>
          )
        })}

      </div>

      {/* STORY VIEWER */}
      {selectedStories && (
        <StoryViewer
          stories={selectedStories}
          currentIndex={index}
          setIndex={setIndex}
          onClose={() => setSelectedStories(null)}
        />
      )}
    </>
  )
}