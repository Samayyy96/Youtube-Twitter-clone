// app/watch/[videoId]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, Share, Download } from 'lucide-react'; 
import SubscribeButton from '@/app/components/SubscribeButton';
import CommentsSection from '@/app/components/CommentsSection'; 
import SuggestedVideos from '@/app//components/SuggestedVideos';
import LikeButton from '@/app/components/LikeButton';
// Define the shape of the detailed video data
interface VideoDetails {
    _id: string;
    title: string;
    description: string;
    videoFile: { url: string };
    views: number;
    createdAt: string;
    likesCount: number;
    isLiked: boolean;
    owner: {
        _id: string;
        username: string;
        fullName: string;
        avatar: { url: string };
        subscribersCount: number;
        isSubscribed: boolean;
    };
}

export default function WatchPage({ params }: { params: { videoId: string } }) {
    const { videoId } = params;
    const { closeSidebar, isSidebarOpen } = useAuth();

    const [video, setVideo] = useState<VideoDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect to automatically collapse the sidebar
    useEffect(() => {
        if (isSidebarOpen) {
            closeSidebar();
        }
    }, [isSidebarOpen, closeSidebar]);

    // Effect to fetch video details
    useEffect(() => {
        const fetchVideoDetails = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            try {
                const res = await fetch(`http://localhost:3000/api/v1/video/${videoId}`, { headers });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message || "Failed to load video");
                setVideo(result.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (videoId) {
            fetchVideoDetails();
        }
    }, [videoId]);

    if (isLoading) return <div className="p-8">Loading video...</div>;
    if (error) return <div className="p-8 text-red-400">Error: {error}</div>;
    if (!video) return <div className="p-8">Video not found.</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6">
            {/* Main Content Column */}
            <div className="w-full lg:w-2/3">
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video src={video.videoFile.url} controls autoPlay className="w-full h-full" />
                </div>
                
                {/* Video Title */}
                <h1 className="text-xl font-bold mt-4">{video.title}</h1>

                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4">
                    {/* Channel Info */}
                    <div className="flex items-center gap-3">
                        <Link href={`/${video.owner.username}`}>
                            <img src={video.owner.avatar.url} alt={video.owner.fullName} className="w-10 h-10 rounded-full"/>
                        </Link>
                        <div>
                            <Link href={`/${video.owner.username}`} className="font-semibold">{video.owner.fullName}</Link>
                            <p className="text-xs text-gray-400">{video.owner.subscribersCount} subscribers</p>
                        </div>
                        <div className="ml-4">
                            <SubscribeButton channelId={video.owner._id} initialSubscribedStatus={video.owner.isSubscribed}/>
                        </div>
                    </div>
                    {/* Like/Share Buttons */}
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <LikeButton 
                            videoId={video._id}
                            initialLikesCount={video.likesCount}
                            initialIsLiked={video.isLiked}
                        />
                        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                            <ThumbsDown size={16} />
                        </button>
                        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm font-semibold"><Share size={16}/> Share</button>
                        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm font-semibold"><Download size={16}/> Download</button>
                    </div>
                </div>

                {/* Description Box */}
                <div className="bg-gray-800 p-4 rounded-xl mt-4 text-sm">
                    <p className="font-semibold">{video.views} views • {formatTimeAgo(video.createdAt)}</p>
                    <p className="mt-2 whitespace-pre-wrap">{video.description}</p>
                </div>
                
                {/* Comments Section */}
                <CommentsSection videoId={videoId} />

            </div>

            {/* Right Sidebar Column */}
            <div className="w-full lg:w-1/3">
                <SuggestedVideos currentVideoId={videoId} />
            </div>
        </div>
    );
}