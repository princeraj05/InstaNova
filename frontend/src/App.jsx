import {BrowserRouter,Routes,Route} from "react-router-dom"

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

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/" element={<Login/>}/>
<Route path="/register" element={<Register/>}/>

<Route path="/home" element={<Home/>}/>
<Route path="/profile" element={<Profile/>}/>
<Route path="/reels" element={<Reels/>}/>
<Route path="/create" element={<CreatePost/>}/>
<Route path="/edit-profile" element={<EditProfile/>}/>

<Route path="/messages" element={<Messages/>}/>
<Route path="/search" element={<Search/>}/>
<Route path="/explore" element={<Explore/>}/>
<Route path="/notifications" element={<Notifications/>}/>
<Route path="/more" element={<More/>}/>

<Route path="/user/:id" element={<UserProfile/>}/>

</Routes>

</BrowserRouter>

)

}

export default App