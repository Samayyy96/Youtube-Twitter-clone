"use client";

import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import type { Video } from "../types";
import { useRouter } from "next/navigation";

export default function LikedPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLikedVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Authentication token not found. Please log in.");
          setIsLoading(false);
          router.push("/auth");
          return;
        }
        const res = await fetch("http://localhost:3000/api/v1/likes/videos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let result;
        try {
          result = await res.json();
        } catch {
          setError(
            "The server did not return valid data. This usually means the endpoint does not exist, the backend is not running, or you are not authenticated."
          );
          setIsLoading(false);
          return;
        }
        if (!res.ok) throw new Error(result.message || "Failed to fetch liked videos");
        // Map backend data to Video type - the backend returns an array of objects with likedVideo property
        const videos = (result.data || []).map((item: any) => {
          const v = item.likedVideo || item; // Handle both structures
          return {
            _id: v._id,
            title: v.title,
            thumbnail: v.thumbnail || { url: v.videoFile?.url || "" },
            ownerDetails: v.ownerDetails || v.owner || { _id: v.owner?._id || "", username: v.owner?.username || "", avatar: v.owner?.avatar },
            views: v.views || 0,
            createdAt: v.createdAt,
            duration: v.duration || 0,
          };
        });
        setVideos(videos);
      } catch (err: any) {
        setError(err.message || "Failed to load liked videos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLikedVideos();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Liked Videos</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-400 whitespace-pre-line">{error}</div>
      ) : videos.length === 0 ? (
        <div className="text-gray-400">No liked videos found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
