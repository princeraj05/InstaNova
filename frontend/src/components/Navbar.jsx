import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiHome, FiSearch, FiCompass, FiHeart,
  FiUser, FiPlusSquare, FiMenu, FiLogOut
} from "react-icons/fi";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { BsChatDots } from "react-icons/bs";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 text-base transition-colors rounded-lg px-3 py-2.5
        ${isActive(to)
          ? "text-gray-900 font-semibold bg-gray-100"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );

  const MobileLink = ({ to, icon: Icon }) => (
    <Link
      to={to}
      className={`flex items-center justify-center p-2 rounded-xl transition-colors
        ${isActive(to) ? "text-indigo-600" : "text-gray-500"}`}
    >
      <Icon size={22} />
    </Link>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden md:flex flex-col justify-between w-64 h-screen fixed left-0 top-0 border-r border-gray-100 bg-white px-4 py-6 z-30">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-8 px-3">Instagram</h1>
          <nav className="flex flex-col gap-1">
            <NavLink to="/home" icon={FiHome} label="Home" />
            <NavLink to="/reels" icon={MdOutlineVideoLibrary} label="Reels" />
            <NavLink to="/messages" icon={BsChatDots} label="Messages" />
            <NavLink to="/search" icon={FiSearch} label="Search" />
            <NavLink to="/explore" icon={FiCompass} label="Explore" />
            <NavLink to="/notifications" icon={FiHeart} label="Notifications" />
            <NavLink to="/create" icon={FiPlusSquare} label="Create" />
            <NavLink to="/profile" icon={FiUser} label="Profile" />
            <NavLink to="/more" icon={FiMenu} label="More" />
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
        >
          <FiLogOut size={18} /> Logout
        </button>
      </div>

      {/* ── MOBILE BOTTOM NAVBAR ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center px-2 py-2 z-50 safe-area-pb">
        <MobileLink to="/home" icon={FiHome} />
        <MobileLink to="/search" icon={FiSearch} />
        <MobileLink to="/messages" icon={BsChatDots} />
        <MobileLink to="/create" icon={FiPlusSquare} />
        <MobileLink to="/reels" icon={MdOutlineVideoLibrary} />
        <MobileLink to="/profile" icon={FiUser} />
      </div>
    </>
  );
}