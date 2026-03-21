import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios"   // ✅ USE THIS

export default function More() {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleDelete = async () => {
    try {
      setLoading(true)

      // ✅ FIXED (no manual token needed)
      await API.delete("/user/delete-account")

      alert("Account deleted successfully 😢")

      localStorage.removeItem("token")
      navigate("/login")

    } catch (error) {
      console.error(error)
      alert("Error deleting account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <Navbar />

      <div style={{ marginLeft: "250px", padding: "40px" }}>
        <h2>More</h2>
        <p>Settings and more options</p>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "red",
            color: "white",
            padding: "10px 20px",
            border: "none",
            marginTop: "20px",
            cursor: "pointer",
            borderRadius: "5px"
          }}
        >
          Delete Account
        </button>

        {showModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "10px",
              width: "300px",
              textAlign: "center"
            }}>
              <h3>⚠️ Delete Account</h3>
              <p>This action cannot be undone!</p>

              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  background: "red",
                  color: "white",
                  padding: "10px",
                  margin: "10px",
                  border: "none",
                  borderRadius: "5px"
                }}
              >
                {loading ? "Deleting..." : "Delete Permanently"}
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px",
                  border: "1px solid gray",
                  borderRadius: "5px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}