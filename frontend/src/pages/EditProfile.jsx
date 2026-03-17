import { useState, useEffect } from "react"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import { useNavigate } from "react-router-dom"
import { FiCamera, FiUser, FiFileText } from "react-icons/fi"

export default function EditProfile() {
  const userId = localStorage.getItem("userId")
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [profilePic, setProfilePic] = useState(null)
  const [preview, setPreview] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get(`/user/${userId}`)
        setUsername(res.data.username || "")
        setBio(res.data.bio || "")
        setPreview(res.data.profilePic || "")
      } catch (err) { console.log(err) }
    }
    if (userId) fetchUser()
  }, [userId])

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("bio", bio)
      if (profilePic) formData.append("profilePic", profilePic)
      await API.put(`/user/${userId}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      alert("Profile updated!")
      navigate("/profile")
    } catch (err) { console.log(err); alert("Update failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex-1 md:ml-64 flex justify-center items-start p-4 pb-20 md:pb-6 pt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
            <p className="text-sm text-gray-400 mt-0.5">Update your information</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar upload */}
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <img
                  src={preview || `https://ui-avatars.com/api/?name=${username}&background=6366f1&color=fff&size=120`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <FiCamera size={22} className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-white">
                  <FiCamera size={13} className="text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { setProfilePic(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])) }} />
              </label>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Username</label>
              <div className="relative">
                <FiUser size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Bio</label>
              <div className="relative">
                <FiFileText size={15} className="absolute left-3 top-3 text-gray-400" />
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Write something about yourself..." rows={3}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition resize-none" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button onClick={() => navigate("/profile")}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleUpdate} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}