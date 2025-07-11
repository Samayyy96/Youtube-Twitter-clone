// app/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; // 1. IMPORT THE AUTH HOOK
import { GoPlusCircle, GoSearch } from 'react-icons/go';
import { IoNotificationsOutline } from 'react-icons/io5';

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth(); // 2. GET STATE AND FUNCTIONS FROM THE CONTEXT

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-[#0F0F0F] border-b border-gray-800">
      {/* Left Side */}
      <Link href="/" className="text-xl font-bold">MyTube</Link>

      {/* Center - Search Bar */}
      <div className="flex-grow max-w-2xl hidden sm:flex">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-l-full focus:outline-none focus:border-blue-500"
        />
        <button className="px-5 py-2 bg-gray-800 border border-gray-700 border-l-0 rounded-r-full hover:bg-gray-700">
          <GoSearch />
        </button>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          // 3. UI FOR LOGGED-IN USERS
          <>
            <Link href="/upload" className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-700" title="Create">
              <GoPlusCircle className="text-2xl" />
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-700" title="Notifications">
              <IoNotificationsOutline className="text-2xl" />
            </button>
            <Link href="/profile" className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full font-bold text-white" title="Profile">
              R
            </Link>
            <button onClick={logout} className="ml-2 text-sm text-gray-400 hover:text-white">
              Logout
            </button>
          </>
        ) : (
          // 4. UI FOR LOGGED-OUT USERS
          <Link href="/auth" className="px-4 py-2 text-blue-400 border border-gray-700 rounded-full hover:bg-blue-400/10">
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
}