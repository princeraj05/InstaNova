import { useEffect, useState } from "react"
import API from "../api/axios"
import StoryViewer from "./StoryViewer"

export default function StoryBar() {
  const [grouped, setGrouped] = useState({})
  const [selectedStories, setSelectedStories] = useState(null)
  const [index, setIndex] = useState(0)
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
      {/* STORY BAR */}
      <div className="flex gap-4 overflow-x-auto mb-5 pb-2 scrollbar-hide">

        {Object.values(grouped).map((userStories) => {
          const first = userStories[0]
          const seen = seenStories.includes(first.user._id)

          return (
            <div
              key={first._id}
              className="flex flex-col items-center cursor-pointer shrink-0"
              onClick={() => {
                setSelectedStories(userStories)
                setIndex(0)
                setSeenStories(prev => [...new Set([...prev, first.user._id])])
              }}
            >
              {/* 🔥 GRADIENT RING - Instagram style */}
              <div
                className={`w-16 h-16 rounded-full p-[2px] ${
                  seen
                    ? "bg-gray-300"
                    : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                }`}
              >
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                  <img
                    src={
                      first.user?.profilePic ||
                      `https://ui-avatars.com/api/?name=${first.user?.username}`
                    }
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

        {/* Empty state */}
        {Object.keys(grouped).length === 0 && (
          <p className="text-xs text-gray-400 py-2">No stories yet</p>
        )}

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