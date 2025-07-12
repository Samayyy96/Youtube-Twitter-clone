// app/page.tsx

// 1. THIS IS THE MOST IMPORTANT CHANGE.
// It converts this page from a Server Component to a Client Component.
'use client';

import { useState, useEffect } from 'react';
import VideoCard from "./components/VideoCard";
import type { Video } from './types'; // Make sure you have this types file
import { useAuth } from './context/AuthContext'; // Import the auth hook

export default function HomePage() {
  // 2. Use React hooks for state management, just like in your upload page.
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the logged-in status to decide whether to fetch

  // 3. Use useEffect to fetch data when the component loads (or when login status changes).
  useEffect(() => {
    // Don't bother fetching if the user isn't logged in.
    

    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);

      

      try {
        // 5. Make the fetch call WITH the Authorization header.
        const response = await fetch('http://localhost:3000/api/v1/video/', {
          
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch videos.');
        }

        setVideos(result.data.docs || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []); // Re-run this effect if the login status changes.


  // 6. Render UI based on the current state.
  if (isLoading) {
    return <p className="text-center mt-8">Loading videos...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-400">Error: {error}</p>;
  }
  
  

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))
        ) : (
          <p className="col-span-full text-center mt-8">No videos found. Be the first to upload!</p>
        )}
      </div>
    </div>
  );
}