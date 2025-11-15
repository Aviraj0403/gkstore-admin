import React from "react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: "url('/your-image.jpg')" }}>
      {/* Dark overlay to improve readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 text-center text-white p-6 max-w-lg mx-auto">
        <img
          src="/beauty.gif" // Make sure the gif is in your public folder
          alt="Beauty GIF"
          className="mx-auto mb-6 max-w-xs"
        />
        <h1 className="text-4xl font-bold text-pink-500">Access Denied</h1>
        <p className="mt-4 text-lg">You do not have permission to view this page.</p>
      </div>
    </div>
  );
}
