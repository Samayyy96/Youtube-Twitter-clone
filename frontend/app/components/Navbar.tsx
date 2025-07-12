// app/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { GoPlusCircle, GoSearch } from 'react-icons/go';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useState, useEffect } from 'react'; // Import hooks

// A simple type for the user data we expect to fetch
interface CurrentUser {
    username: string;
    avatar?: { url: string };
}

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth(); // Get login state from our simple context
  
  // 1. ADD NEW STATE to hold the user's details
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // 2. ADD AN EFFECT to fetch user details *only if* they are logged in
  useEffect(() => {
    // If the user is not logged in, there's nothing to fetch.
    if (!isLoggedIn) {
      setCurrentUser(null); // Clear any previous user data
      return;
    }

    // Define the async function to fetch the user
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return; // Should not happen if isLoggedIn is true, but good for safety

      try {
        const response = await fetch('http://localhost:3000/api/v1/users/current-user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          setCurrentUser(result.data);
        }
      } catch (error) {
        console.error("Navbar: Failed to fetch user details", error);
      }
    };

    fetchUserDetails();
  }, [isLoggedIn]); // This effect re-runs whenever the login state changes

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-[#0F0F0F] border-b border-gray-800">
      <Link href="/" className="text-xl font-bold">MyTube</Link>

      {/* Search Bar */}
      <div className="flex-grow max-w-2xl hidden sm:flex">
        <input type="text" placeholder="Search" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-l-full focus:outline-none focus:border-blue-500" />
        <button className="px-5 py-2 bg-gray-800 border border-gray-700 border-l-0 rounded-r-full hover:bg-gray-700"><GoSearch /></button>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-4">
        {/* We still use isLoggedIn from context to decide which block to show */}
        {isLoggedIn && currentUser ? (
          // 3. UI FOR LOGGED-IN USERS (now uses 'currentUser' state)
          <>
            <Link href="/upload" className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-700" title="Create">
              <GoPlusCircle className="text-2xl" />
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-700" title="Notifications">
              <IoNotificationsOutline className="text-2xl" />
            </button>
            
            {/* --- THIS IS THE FIX --- */}
            <Link href="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700" title="My Profile">
              {currentUser.avatar?.url ? (
                <img 
                    src={currentUser.avatar.url} 
                    alt={currentUser.username} 
                    className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                // Fallback to the first initial if no avatar
                <span className="font-bold text-white text-lg">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
            
            <button onClick={logout} className="ml-2 text-sm text-gray-400 hover:text-white">
              Logout
            </button>
          </>
        ) : (
          // UI FOR LOGGED-OUT USERS (or when user details are still loading)
          <Link href="/auth" className="px-4 py-2 text-blue-400 border border-gray-700 rounded-full hover:bg-blue-400/10">
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
}