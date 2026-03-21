import { useEffect, useState } from "react"
import API from "../api/axios"
import StoryViewer from "./StoryViewer"

export default function StoryBar() {
  const [grouped, setGrouped] = useState({})
  const [selectedStories, setSelectedStories] = useState(null)
  const [index, setIndex] = useState(0)

  // 🔥 NEW (seen state)
  const [seenStories, setSeenStories] = useState([])

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await API.get("/stories")

        const groupedStories = {}
        data.forEach((s) => {
          if (!groupedStories[s.user._id]) {
            groupedStories[s.user._id] = []
          }
          groupedStories[s.user._id].push(s)
        })

        setGrouped(groupedStories)
      } catch (err) {
        console.log(err)
      }
    }

    fetchStories()
  }, [])

  return (
    <>
      <div className="flex gap-3 overflow-x-auto mb-4 pb-2">

        {Object.values(grouped).map((userStories) => {
          const first = userStories[0]

          // 🔥 CHECK SEEN
          const seen = seenStories.includes(first.user._id)

          return (
            <div
              key={first._id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                setSelectedStories(userStories)
                setIndex(0)

                // 🔥 MARK AS SEEN
                setSeenStories(prev => [...new Set([...prev, first.user._id])])
              }}
            >
              <img
                src={first.user?.profilePic}
                className={`w-14 h-14 rounded-full p-[2px] ${
                  seen ? "border-gray-400" : "border-pink-500"
                }`}
              />
              <p className="text-xs">{first.user?.username}</p>
            </div>
          )
        })}

      </div>

      {/* 🔥 STORY VIEWER */}
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