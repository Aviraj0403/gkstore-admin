import React, { useState, useEffect, useRef } from "react";
import { FaAlignLeft, FaUserAstronaut, FaShoppingBasket } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { useAuth } from "../../context/AuthContext.jsx";
import { redisCache } from "../../services/dashboartdApi.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles

function Header({ toggleSidebar, openSidebar }) {
  const { user, logout } = useAuth();
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [isCacheClearing, setIsCacheClearing] = useState(false);
  const profileRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRebootCache = async () => {
    setIsCacheClearing(true);
    const result = await redisCache();
    setIsCacheClearing(false);
    if (result) {
      toast.success('Cache cleared successfully!');
    } else {
      toast.error('Error clearing cache.');
    }
  };

  return (
    <>
      <header className="bg-orange-100/20 p-4 fixed top-0 left-0 right-0 z-30 backdrop-blur-md shadow-md transition-all ease-in-out duration-300">
        <div className="container mx-auto flex justify-between items-center">
          {/* LEFT SIDE: Logo + Sidebar Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaShoppingBasket size={22} className="text-orange-800" />
              <h1 className="text-lg font-bold text-orange-800">GK_STORE</h1>
            </div>
            {/* Sidebar Toggle */}
            {openSidebar ? (
              <FaAlignLeft
                size={26}
                onClick={toggleSidebar}
                className="cursor-pointer text-gray-700"
                title="Close Sidebar"
              />
            ) : (
              <MdMenu
                size={28}
                onClick={toggleSidebar}
                className="cursor-pointer text-gray-700"
                title="Open Sidebar"
              />
            )}
          </div>

          {/* RIGHT SIDE: Branch, Language, User Profile */}
          <div className="flex items-center space-x-6">
            {/* Branch */}
            <p className="text-sm hidden sm:block text-gray-700">Branch: Delhi</p>

            {/* Cache Reboot Button (hidden on small screens) */}
            <button
              onClick={handleRebootCache}
              disabled={isCacheClearing}
              className={`px-6 py-2 rounded-full text-white transition-all duration-300 transform ${
                isCacheClearing
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 active:scale-95"
              } hidden sm:block`}  
            >
              {isCacheClearing ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-4 border-t-4 border-white rounded-full animate-spin"></div>
                  <span>Rebooting...</span>
                </span>
              ) : (
                "Reboot Cache"
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsOpenProfile((prev) => !prev)}
                className="bg-orange-700 flex items-center gap-2 text-white px-3 py-2 rounded-lg hover:bg-orange-800 transition-all"
              >
                <FaUserAstronaut />
                {user?.userName || "User"}
              </button>

              {/* Profile Widget */}
              {isOpenProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 p-2">
                  <div className="text-sm font-bold">{user?.userName || "User"}</div>
                  <div className="text-xs text-gray-500">{user?.email || "No email available"}</div>
                  <div className="mt-2 border-t pt-2">
                    <button
                      onClick={logout}
                      className="text-red-500 w-full text-left py-1 text-xs hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default Header;
