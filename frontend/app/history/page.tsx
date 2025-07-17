// app/history/page.tsx

"use client";

import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import type { Video } from "../types"; 
import { useRouter } from "next/navigation";
import { serverUrl } from '@/lib/constants';


interface HistoryVideoFromAPI {
    _id: string;
    title: string;
    thumbnail?: { url: string }; 
    videoFile?: { url: string }; 
    ownerDetails?: { 
        _id: string;
        username: string;
        avatar?: { url: string };
    };
    owner?: { 
        _id: string;
        username: string;
        avatar?: { url: string };
    };
    views?: number;
    createdAt: string;
    duration?: number;
}


export default function HistoryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("You need to sign in to access this feature.");
          
          router.push("/auth");
          return;
        }

        const res = await fetch(`${serverUrl}/api/v1/users/watch-history`, { 
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const result = await res.json();
        
        if (!res.ok) {
            throw new Error(result.message || "Failed to fetch watch history");
        }

        // 2. Use our new, specific type instead of 'any'.
        // This makes the code type-safe and removes the ESLint error.
        const cleanedVideos: Video[] = (result.data || []).map((v: HistoryVideoFromAPI) => ({
          _id: v._id,
          title: v.title,
          // Safely determine the thumbnail URL
          thumbnail: v.thumbnail || { url: v.videoFile?.url || "/default-thumbnail.png" }, 
          // Safely determine the owner details and ensure it matches the 'Video' type
          ownerDetails: v.ownerDetails || v.owner || { _id: "unknown", username: "Unknown User" },
          views: v.views || 0,
          createdAt: v.createdAt,
          duration: v.duration || 0,
        }));

        setVideos(cleanedVideos);

      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [router]); // router should be in the dependency array

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Watch History</h1>
      {isLoading ? (
        <div className="text-center text-gray-400">Loading your history...</div>
      ) : error ? (
        <div className="text-red-400 text-center">{error}</div>
      ) : videos.length === 0 ? (
        <div className="text-gray-400 text-center">No watch history found.</div>
      ) : (
        // Changed to a list view which is more common for history
        <div className="space-y-4 max-w-4xl mx-auto">
          {videos.map((video) => (
            // A smaller card variant might be better for history, but VideoCard works
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}