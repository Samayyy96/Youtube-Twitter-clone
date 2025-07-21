'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext'; // Adjust path if needed
import axios from 'axios';
import { serverUrl } from '@/lib/constants'; // Adjust path if needed
import VideoSkeleton from '@/app/components/ui/VideoSkeleton';
const SERVER_URL = serverUrl;

const apiClient = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true, // This is CRUCIAL for the session to work
});

const GoogleAuthCallbackPage = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Finalizing your login, please wait...');

  useEffect(() => {
    // This effect runs once when the page loads
    const finalizeLogin = async () => {
      try {
        // Call the backend's finalization endpoint. The browser automatically sends the session cookie.
        const response = await apiClient.get('/api/v1/users/google/finalize');

        const data = response.data?.data;

        if (data && data.accessToken) {
          setMessage('Login successful! Redirecting...');
          // Use the login function from AuthContext to save the token and update state
          login(data.accessToken);
          // Redirect to the homepage after a short delay
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          // This case should ideally not happen if the backend is correct
          throw new Error('Login finalization failed: Token not received.');
        }
      } catch (err: any) {
        console.error("Google login finalization failed:", err);
        const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
        setError(`Could not complete your sign-in. ${errorMessage}`);
        setMessage('Redirecting to login page...');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    finalizeLogin();
    // We only want this to run once, so dependencies are empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <VideoSkeleton />  
      {/* <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-4">Authenticating</h1>
        <p className="text-lg">{message}</p>
        {error && <p className="text-red-400 mt-4">Error: {error}</p>}
        
        <div className="mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div> 
      */}
    </div>
  );
};

export default GoogleAuthCallbackPage;