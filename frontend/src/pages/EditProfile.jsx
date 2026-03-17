import { useState, useEffect } from "react"
import API from "../api/axios"
import { useNavigate } from "react-router-dom"

export default function EditProfile(){

  const userId = localStorage.getItem("userId")
  const navigate = useNavigate()

  const [username,setUsername] = useState("")
  const [bio,setBio] = useState("")
  const [profilePic,setProfilePic] = useState(null)
  const [preview,setPreview] = useState("")

  useEffect(()=>{

    const fetchUser = async()=>{

      try{
        const res = await API.get(`/user/${userId}`)

        setUsername(res.data.username || "")
        setBio(res.data.bio || "")
        setPreview(res.data.profilePic || "")

      }catch(err){
        console.log(err)
      }

    }

    if(userId){
      fetchUser()
    }

  },[userId])


  const handleUpdate = async()=>{

    try{

      const formData = new FormData()

      formData.append("username",username)
      formData.append("bio",bio)

      if(profilePic){
        formData.append("profilePic",profilePic)
      }

      await API.put(`/user/${userId}`,formData,{
        headers:{
          "Content-Type":"multipart/form-data"
        }
      })

      alert("Profile updated")
      navigate("/profile")

    }catch(err){

      console.log(err)
      alert("Update failed")

    }

  }

  return(

    <div style={{padding:"40px"}}>

      <h2>Edit Profile</h2>

      {preview && (

        <img
          src={preview}   // ✅ FIXED (no uploads path)
          style={{
            width:"120px",
            height:"120px",
            borderRadius:"50%",
            objectFit:"cover",
            marginBottom:"20px"
          }}
        />

      )}

      <br/>

      <input
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
        placeholder="username"
      />

      <br/><br/>

      <input
        value={bio}
        onChange={(e)=>setBio(e.target.value)}
        placeholder="bio"
      />

      <br/><br/>

      <input
        type="file"
        onChange={(e)=>{
          setProfilePic(e.target.files[0])
          setPreview(URL.createObjectURL(e.target.files[0]))
        }}
      />

      <br/><br/>

      <button onClick={handleUpdate}>
        Update Profile
      </button>

    </div>

  )
}