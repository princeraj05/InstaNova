import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"

export default function More() {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleDelete = async () => {
    try {
      setLoading(true)
      await API.delete("/user/delete-account")
      alert("Account deleted successfully 😢")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      navigate("/")
    } catch (error) {
      console.error(error)
      alert("Error deleting account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 lg:ml-72 transition-all duration-300">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              More
            </h2>
            <p className="mt-1 text-sm sm:text-base text-gray-500">
              Settings and more options
            </p>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-red-50">
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider">
                Danger Zone
              </h3>
            </div>

            <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">Delete Account</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Permanently remove your account and all associated data.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && setShowModal(false)}
          />

          {/* Dialog */}
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="px-6 pt-4 pb-6 sm:p-6">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-gray-900 text-center">
                Delete Account
              </h3>
              <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">
                This will permanently delete your account and all your data. This action{" "}
                <span className="font-semibold text-gray-700">cannot be undone</span>.
              </p>

              {/* Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                    "Delete Permanently"
                  )}
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="w-full sm:flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-semibold rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
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