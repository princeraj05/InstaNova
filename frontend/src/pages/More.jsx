import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"
import {
  FiTrash2, FiLogOut, FiAlertTriangle, FiInfo,
  FiShield, FiHelpCircle, FiChevronRight
} from "react-icons/fi"

export default function More() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // ── DELETE ACCOUNT ──
  const handleDelete = async () => {
    try {
      setLoading(true)
      await API.delete("/user/delete-account")
      alert("Account deleted successfully 😢")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("userId")
      navigate("/")
    } catch (error) {
      console.error(error)
      alert("Error deleting account")
    } finally {
      setLoading(false)
    }
  }

  // ── LOGOUT ──
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userId")
    navigate("/")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">More</h2>
            <p className="mt-1 text-sm text-gray-500">Settings and account options</p>
          </div>

          {/* ── INFO CARDS ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">General</h3>
            </div>

            <div className="divide-y divide-gray-100">
              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FiInfo size={16} className="text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">About</p>
                    <p className="text-xs text-gray-400">App info and version</p>
                  </div>
                </div>
                <FiChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition" />
              </button>

              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                    <FiShield size={16} className="text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">Privacy Policy</p>
                    <p className="text-xs text-gray-400">How we handle your data</p>
                  </div>
                </div>
                <FiChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition" />
              </button>

              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                    <FiHelpCircle size={16} className="text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">Help & Support</p>
                    <p className="text-xs text-gray-400">FAQs and contact us</p>
                  </div>
                </div>
                <FiChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition" />
              </button>
            </div>
          </div>

          {/* ── LOGOUT CARD ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
            </div>

            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <FiLogOut size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Logout</p>
                  <p className="text-xs text-gray-400">Sign out of your account</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              >
                <FiLogOut size={15} /> Logout
              </button>
            </div>
          </div>

          {/* ── DANGER ZONE CARD ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-red-50">
              <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider">Danger Zone</h3>
            </div>

            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <FiTrash2 size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Delete Account</p>
                  <p className="text-xs text-gray-400">Permanently remove your account and all data</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <FiTrash2 size={15} /> Delete Account
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="px-6 pt-4 pb-6 sm:p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mx-auto mb-4">
                <FiLogOut size={22} className="text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Logout</h3>
              <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">
                Are you sure you want to logout from your account?
              </p>
              <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                <button
                  onClick={handleLogout}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                >
                  <FiLogOut size={15} /> Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ACCOUNT MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && setShowDeleteModal(false)} />
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="px-6 pt-4 pb-6 sm:p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <FiAlertTriangle size={22} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Delete Account</h3>
              <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">
                This will permanently delete your account and all your data. This action{" "}
                <span className="font-semibold text-gray-700">cannot be undone</span>.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <><FiTrash2 size={15} /> Delete Permanently</>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                  className="w-full sm:flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}