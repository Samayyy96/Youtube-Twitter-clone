'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import new hooks
import axios from 'axios';

// Import the new modal component
import GoogleLoginFallbackModal from '../components/GoogleLoginFallbackModal'; 
import { serverUrl } from '@/lib/constants';

const apiClient = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isCompleteClose: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [completeClose, setCompleteClose] = useState(false);

  // --- NEW STATE FOR THE GOOGLE LOGIN FALLBACK ---
  const [isFinalizingGoogleLogin, setIsFinalizingGoogleLogin] = useState(false);
  const [googleLoginError, setGoogleLoginError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- NEW EFFECT TO HANDLE GOOGLE LOGIN FINALIZATION ---
  useEffect(() => {
    // Check if the special query parameter exists in the URL
    const isGoogleAuthPending = searchParams.get('google_auth') === 'pending';

    if (isGoogleAuthPending) {
      // Show the modal immediately
      setIsFinalizingGoogleLogin(true);

      const finalize = async () => {
        try {
          const response = await apiClient.get('/api/v1/users/google/finalize');
          const data = response.data?.data;

          if (data && data.accessToken) {
            login(data.accessToken);
            // On success, close the modal and clean the URL
            setIsFinalizingGoogleLogin(false);
            router.replace('/'); // .replace() cleans the URL without adding to history
          } else {
            throw new Error('Token was not found in the response.');
          }
        } catch (err: any) {
          console.error("Google login finalization failed:", err);
          const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
          setGoogleLoginError(`Could not complete sign-in. ${errorMessage}`);
          // Keep the modal open to show the error.
          // We still clean the URL.
          router.replace('/');
        }
      };

      finalize();
    }
  }, [searchParams, router]); // This effect runs only when the URL search params change


  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('accessToken', token);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await apiClient.post('/api/v1/users/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      window.location.href = '/auth';
    }
  };

  const toggleSidebar = () => {
    if (completeClose) {
      setCompleteClose(false);
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };

  const closeSidebar = () => {
    setCompleteClose(true);
  };

  const closeFallbackModal = () => {
    setIsFinalizingGoogleLogin(false);
    setGoogleLoginError(null);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isSidebarOpen, toggleSidebar, closeSidebar, isCompleteClose: completeClose }}>
      {children}

      {/* RENDER THE MODAL when finalization is in progress */}
      {isFinalizingGoogleLogin && (
        <GoogleLoginFallbackModal
          error={googleLoginError}
          onClose={closeFallbackModal}
        />
      )}
    </AuthContext.Provider>
  );
};