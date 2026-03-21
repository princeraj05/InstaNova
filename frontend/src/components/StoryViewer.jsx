import { useEffect, useState } from "react"

export default function StoryViewer({ stories, currentIndex, setIndex, onClose }) {
  const [progress, setProgress] = useState(0)

  const story = stories[currentIndex]

  // 🔥 PROGRESS BAR + AUTO NEXT
  useEffect(() => {
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentIndex])

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setIndex(currentIndex + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIndex(currentIndex - 1)
    }
  }

  if (!story) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">

      {/* CLOSE */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-xl z-10"
      >
        ✕
      </button>

      <div className="w-full max-w-md h-[85vh] relative">

        {/* 🔥 PROGRESS BARS */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-gray-500/40 rounded">
              <div
                className="h-full bg-white rounded"
                style={{
                  width:
                    i === currentIndex
                      ? `${progress}%`
                      : i < currentIndex
                      ? "100%"
                      : "0%"
                }}
              />
            </div>
          ))}
        </div>

        {/* USER */}
        <div className="absolute top-6 left-3 flex items-center gap-2 text-white z-10">
          <img
            src={story.user?.profilePic}
            className="w-8 h-8 rounded-full"
          />
          <p className="text-sm font-semibold">{story.user?.username}</p>
        </div>

        {/* MEDIA */}
        {story.media?.includes(".mp4") ? (
          <video
            src={story.media}
            autoPlay
            muted
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <img
            src={story.media}
            className="w-full h-full object-cover rounded-lg"
          />
        )}

        {/* CLICK AREAS */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2" onClick={handlePrev}></div>
          <div className="w-1/2" onClick={handleNext}></div>
        </div>

      </div>
    </div>
  )
}