import { useState } from "react"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import { useNavigate } from "react-router-dom"
import { FiSearch, FiUserPlus } from "react-icons/fi"

export default function Search() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  const currentUserId = localStorage.getItem("userId")

  const handleSearch = async (e) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 0) {
      try {
        const res = await API.get(`/search?username=${value}`)
        setUsers(res.data || [])
      } catch { setUsers([]) }
    } else { setUsers([]) }
  }

  const followUser = async (id) => {
    try {
      const res = await API.put(`/user/follow/${id}`, { currentUserId })
      alert(res.data.message || "Success")
      setUsers(users.filter(u => u._id !== id))
    } catch { alert("Follow failed") }
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-md px-4 py-6 pb-20 md:pb-6">

          <h2 className="text-xl font-bold text-gray-900 mb-5">Search</h2>

          {/* Search input */}
          <div className="relative mb-6">
            <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search username..."
              value={query}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition shadow-sm"
            />
          </div>

          {/* Results */}
          <div className="space-y-2">
            {query.length > 0 && users.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <FiSearch size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No users found for "{query}"</p>
              </div>
            )}
            {users.map(user => (
              <div key={user._id}
                className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition">
                <div onClick={() => navigate(`/user/${user._id}`)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                  <img
                    src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=40`}
                    className="w-11 h-11 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
                    {user.bio && <p className="text-xs text-gray-400 truncate">{user.bio}</p>}
                  </div>
                </div>
                <button onClick={() => followUser(user._id)}
                  className="ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition flex-shrink-0">
                  <FiUserPlus size={13} /> Follow
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}