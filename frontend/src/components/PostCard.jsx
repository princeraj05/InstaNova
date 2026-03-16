const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function PostCard({ post }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
      <img
        src={`${SERVER_URL}/uploads/${post.media}`}
        width="300"
      />
      <p>{post.caption}</p>
    </div>
  );
}