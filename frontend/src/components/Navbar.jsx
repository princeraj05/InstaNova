import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiHeart,
  FiUser,
  FiPlusSquare,
  FiMenu,
  FiLogOut
} from "react-icons/fi";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { BsChatDots } from "react-icons/bs";

export default function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (

    <>
    {/* Desktop Sidebar */}
    <div className="hidden md:flex flex-col justify-between w-64 h-screen fixed left-0 top-0 border-r bg-white p-6">

      <div>
        <h1 className="text-2xl font-bold mb-10">Instagram</h1>

        <div className="flex flex-col gap-6 text-gray-700 text-lg">

          <Link className="flex items-center gap-3 hover:text-black" to="/home">
            <FiHome /> Home
          </Link>

          <Link className="flex items-center gap-3 hover:text-black" to="/reels">
            <MdOutlineVideoLibrary /> Reels
          </Link>

          <Link className="flex items-center gap-3 hover:text-black" to="/messages">
            <BsChatDots /> Messages
          </Link>

          <Link className="flex items-center gap-3 hover:text-black" to="/search">
            <FiSearch /> Search
          </Link>

          <Link className="flex items-center gap-3 hover:text-black" to="/explore">
            <FiCompass /> Explore
          </Link>

          <Link className="flex items-center gap-3 hover:text-black" to="/notifications">
            <FiHeart /> Notifications
          </Link>

          <Link className="flex items-center gap-3 hover:text-black" to="/create">
            <FiPlusSquare /> Create
          </Link>

          <Link className="flex items-center gap-3 hover:text-black" to="/profile">
            <FiUser /> Profile
          </Link>

          <Link className="flex items-center gap-3 hover:text-black" to="/more">
            <FiMenu /> More
          </Link>

        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        <FiLogOut /> Logout
      </button>

    </div>


    {/* Mobile Bottom Navbar */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 text-xl">

      <Link to="/home"><FiHome /></Link>

      <Link to="/search"><FiSearch /></Link>

      <Link to="/create"><FiPlusSquare /></Link>

      <Link to="/reels"><MdOutlineVideoLibrary /></Link>

      <Link to="/profile"><FiUser /></Link>

    </div>

    </>
  );
}