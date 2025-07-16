'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation'; // 1. IMPORT THE ROUTER
import Link from 'next/link';
import { formatTimeAgo, formatViews } from '@/lib/utils';
import { ThumbsDown, Share, Download, MoreHorizontal } from 'lucide-react';
import SubscribeButton from '@/app/components/SubscribeButton';
import CommentsSection from '@/app/components/CommentsSection';
import SuggestedVideos from '@/app/components/SuggestedVideos';
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
    const { isLoggedIn, closeSidebar, isSidebarOpen } = useAuth(); // 2. GET isLoggedIn FROM CONTEXT
    const router = useRouter(); // 3. INITIALIZE THE ROUTER

    const [video, setVideo] = useState<VideoDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFullDescription, setShowFullDescription] = useState(false);

    // 4. ADD useEffect TO CHECK AUTH STATUS AND REDIRECT
    useEffect(() => {
        // The AuthProvider sets isLoggedIn after checking the token.
        // If it's explicitly false, the user is not logged in.
        if (isLoggedIn === false) {
            router.push('/auth');
        }
    }, [isLoggedIn, router]);

    // This effect for collapsing the sidebar remains the same
    useEffect(() => {
        if (isSidebarOpen) closeSidebar();
    }, [isSidebarOpen, closeSidebar]);

    // This effect for fetching data now depends on isLoggedIn
    useEffect(() => {
        // Don't bother fetching if we know the user is not logged in.
        if (!isLoggedIn) {
            setIsLoading(false); // Stop the loading state
            return;
        }

        const fetchVideoDetails = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');
            // We can be more confident the token exists now, but a check is still good practice.
            if (!token) {
                setError("Authentication token is missing.");
                setIsLoading(false);
                return;
            }

            const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
            
            try {
                const res = await fetch(`http://localhost:3000/api/v1/video/${videoId}`, { headers });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message || "Failed to load video");
                setVideo(result.data);
            } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('An unexpected error occurred');
  }
}
 finally {
                setIsLoading(false);
            }
        };
        
        if (videoId) {
            fetchVideoDetails();
        }
    }, [videoId, isLoggedIn]); // Add isLoggedIn as a dependency

    // Render loading/redirecting state
    if (isLoading || isLoggedIn === null) {
        return <div className="p-8 text-center">Loading...</div>;
    }
    
    // If not logged in, the redirect will happen, but we can show a message in the meantime.
    if (!isLoggedIn) {
        return <div className="p-8 align-center text-xl text-center">Redirecting to login...</div>;
    }

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-400">Error: {error}</div>;
    if (!video) return <div className="p-8">Video not found.</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-6 py-6">
            {/* Main Content Column */}
            <div className="w-full lg:flex-grow">
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video src={video.videoFile.url} controls autoPlay className="w-full h-full" />
                </div>
                
                {/* Video Title */}
                <h1 className="text-xl font-bold mt-4 text-white">{video.title}</h1>

                {/* --- Actions Bar - NEW STYLES --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-3 gap-4">
                    {/* Channel Info & Subscribe Button */}
                    <div className="flex items-center gap-3">
                        <Link href={`/${video.owner.username}`}>
                        
                            <img src={video.owner.avatar.url} alt={video.owner.fullName} className="w-10 h-10 rounded-full"/>
                        </Link>
                        <div>
                            <Link href={`/${video.owner.username}`} className="font-semibold text-white">{video.owner.username}</Link>
                            <p className="text-xs text-gray-400">{formatViews(video.owner.subscribersCount)} subscribers</p>
                        </div>
                        <div className="ml-4">
                             {/* The SubscribeButton component needs styling adjustments */}
                            <SubscribeButton channelId={video.owner._id} initialSubscribedStatus={video.owner.isSubscribed}/>
                        </div>
                    </div>
                    
                    {/* Like/Share/Download Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center bg-gray-800 rounded-full">
                            <LikeButton videoId={video._id} initialLikesCount={video.likesCount} initialIsLiked={video.isLiked} />
                            <div className="border-l border-gray-600 h-6 my-1"></div>
                            <button className="px-4 py-2 hover:bg-gray-700 rounded-r-full"><ThumbsDown size={16} /></button>
                        </div>
                        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm font-semibold"><Share size={16}/> Share</button>
                        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm font-semibold"><Download size={16}/> Download</button>
                        <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full"><MoreHorizontal size={16}/></button>
                    </div>
                </div>

                {/* --- Description Box - NEW STYLES --- */}
                <div className="bg-gray-800 p-3 rounded-xl mt-4 text-sm cursor-pointer" onClick={() => setShowFullDescription(!showFullDescription)}>
                    <div className="flex gap-4 font-semibold">
                        <span>{formatViews(video.views)} views</span>
                        <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>
                    <div className={`mt-2 whitespace-pre-wrap ${!showFullDescription && 'line-clamp-2'}`}>
                        {video.description}
                    </div>
                    <button className="font-semibold mt-2">
                        {showFullDescription ? '...less' : '...more'}
                    </button>
                </div>
                
                {/* Comments Section */}
                <CommentsSection videoId={videoId} />

            </div>

            {/* Right Sidebar Column */}
            <div className="w-full lg:w-1/3 xl:w-1/4">
                <SuggestedVideos currentVideoId={videoId} channelId={video.owner._id} />
            </div>
        </div>
    );
}