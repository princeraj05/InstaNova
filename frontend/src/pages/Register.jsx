import { useState } from "react"
import API from "../api/axios"
import { Link, useNavigate } from "react-router-dom"

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    setLoading(true)
    try {
      const res = await API.post("/auth/register", { username, email, password })
      alert(res.data.message)
      navigate("/")
    } catch { alert("Register failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <svg width="30" height="30" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1">Join Instagram today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-gray-50"
            placeholder="Username"
            onChange={e => setUsername(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-gray-50"
            placeholder="Email address"
            type="email"
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-gray-50"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={handleRegister} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Create Account
          </button>
        </div>

        <p className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-500 font-semibold hover:underline">Sign In</Link>
        </p>

      </div>
    </div>
  )
}