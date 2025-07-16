"use client";

import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import type { Video } from "../types";
import {useRouter} from "next/navigation";
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
          setError("You need to sign in to access this feature ");
          setIsLoading(false);
          router.push("/auth");
          return;
        }
        const res = await fetch("http://localhost:3000/api/v1/users/history", {
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
        if (!res.ok) throw new Error(result.message || "Failed to fetch watch history");
        // Map backend data to Video type if needed
        const videos = (result.data || []).map((v: any) => ({
          _id: v._id,
          title: v.title,
          thumbnail: v.thumbnail || { url: v.videoFile?.url || "" },
          ownerDetails: v.ownerDetails || v.owner || { _id: v.owner?._id || "", username: v.owner?.username || "", avatar: v.owner?.avatar },
          views: v.views || 0,
          createdAt: v.createdAt,
          duration: v.duration || 0,
        }));
        setVideos(videos);
      } catch (err: any) {
        setError(err.message || "Failed to load watch history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Watch History</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-400 whitespace-pre-line">{error}</div>
      ) : videos.length === 0 ? (
        <div className="text-gray-400">No watch history found.</div>
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
