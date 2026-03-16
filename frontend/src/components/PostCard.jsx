const SERVER = "https://instagram-clone-mern-1luog.onrender.com"

export default function PostCard({post}) {

return(

<div style={{border:"1px solid #ccc",padding:"10px",margin:"10px"}}>

<img
src={`${SERVER}/uploads/${post.media}`}
width="300"
/>

<p>{post.caption}</p>

</div>

)

}