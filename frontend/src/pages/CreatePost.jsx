import { useState } from "react"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import { FiUpload, FiImage, FiVideo, FiType } from "react-icons/fi"

export default function CreatePost() {
  const [media, setMedia] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState("")
  const [type, setType] = useState("post")
  const [loading, setLoading] = useState(false)

  const userId = localStorage.getItem("userId")

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setMedia(file)
    setPreview(URL.createObjectURL(file))
    if (file.type.startsWith("video")) setType("reel")
    else setType("post")
  }

  const handleUpload = async () => {
    if (!media) { alert("Please select a file"); return }
    setLoading(true)
    const formData = new FormData()
    formData.append("media", media)
    formData.append("caption", caption)
    formData.append("mediaType", type)
    formData.append("userId", userId)
    try {
      await API.post("/posts/create", formData, { headers: { "Content-Type": "multipart/form-data" } })
      alert("Uploaded successfully!")
      setMedia(null); setPreview(null); setCaption(""); setType("post")
    } catch (err) {
      console.log(err); alert("Upload failed")
    } finally { setLoading(false) }
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex-1 md:ml-64 flex justify-center items-start p-4 pb-20 md:pb-6 pt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Create Post</h2>
            <p className="text-sm text-gray-400 mt-0.5">Share a photo or video</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Type toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button onClick={() => setType("post")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition
                  ${type === "post" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                <FiImage size={16} /> Photo
              </button>
              <button onClick={() => setType("reel")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition
                  ${type === "reel" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                <FiVideo size={16} /> Reel
              </button>
            </div>

            {/* File upload area */}
            <label className={`block w-full cursor-pointer rounded-xl border-2 border-dashed transition
              ${preview ? "border-indigo-200 bg-indigo-50" : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50"}`}>
              {preview ? (
                <div className="relative">
                  {type === "reel"
                    ? <video src={preview} className="w-full max-h-72 object-contain rounded-xl" controls />
                    : <img src={preview} className="w-full max-h-72 object-contain rounded-xl" />
                  }
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    Tap to change
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <FiUpload size={22} className="text-indigo-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">Images & videos supported</p>
                  </div>
                </div>
              )}
              <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
            </label>

            {/* Caption */}
            <div className="relative">
              <FiType size={15} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                placeholder="Write a caption..."
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-gray-50"
              />
            </div>

            {/* Upload button */}
            <button onClick={handleUpload} disabled={loading || !media}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2
                ${media && !loading
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-indigo-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
              ) : (
                <><FiUpload size={16} /> Upload</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}