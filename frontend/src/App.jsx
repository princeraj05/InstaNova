import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Reels from "./pages/Reels"
import CreatePost from "./pages/CreatePost"
import EditProfile from "./pages/EditProfile"
import Messages from "./pages/Messages"
import Search from "./pages/Search"
import Explore from "./pages/Explore"
import Notifications from "./pages/Notifications"
import More from "./pages/More"
import UserProfile from "./pages/UserProfile"

import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/reels" element={
          <ProtectedRoute><Reels /></ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute><CreatePost /></ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute><EditProfile /></ProtectedRoute>
        } />

        <Route path="/messages" element={
          <ProtectedRoute><Messages /></ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute><Search /></ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute><Explore /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><Notifications /></ProtectedRoute>
        } />
        <Route path="/more" element={
          <ProtectedRoute><More /></ProtectedRoute>
        } />

        <Route path="/user/:id" element={
          <ProtectedRoute><UserProfile /></ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App