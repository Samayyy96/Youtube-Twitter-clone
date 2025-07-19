
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void; 
  logout: () => void;
  isSidebarOpen: boolean; 
  toggleSidebar: () => void; 
  closeSidebar: () => void;   //complete close
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
  const [completeClose, setCompleteClose] = useState(false); // For complete close functionality
  const [isLoading, setIsLoading] = useState(true);

  //sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    // 1. Save the token to localStorage.
    localStorage.setItem('accessToken', token);
    // 2. Update the application's state to reflect the login.
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    window.location.href = '/'; 
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

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isSidebarOpen, toggleSidebar, closeSidebar , isCompleteClose: completeClose,  }}>
      {children}
    </AuthContext.Provider>
  );
};