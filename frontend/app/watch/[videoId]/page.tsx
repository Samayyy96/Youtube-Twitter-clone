// This page fetches details for a SINGLE video
// We'll make it a Client Component to fetch user-specific data like "isLiked"

'use client';

import { useEffect, useState } from 'react';

// You can expand this type later
interface VideoDetails {
    _id: string;
    title: string;
    description: string;
    videoFile: { url: string };
    likesCount: number;
    isLiked: boolean;
    owner: {
        username: string;
        subscribersCount: number;
    };
}

export default function WatchPage({ params }: { params: { videoId: string } }) {
    const { videoId } = params;
    const [video, setVideo] = useState<VideoDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!videoId) return;

        const fetchVideoDetails = async () => {
            const token = localStorage.getItem('accessToken');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            try {
                const res = await fetch(`http://localhost:3000/api/v1/video/${videoId}`, { headers });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message);
                setVideo(result.data);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchVideoDetails();
    }, [videoId]);

    if (error) return <p>Error: {error}</p>;
    if (!video) return <p>Loading video...</p>;

    return (
        <div style={{ display: 'flex', gap: '1rem' }}>
            {/* Main Content */}
            <div style={{ flex: 3 }}>
                <video
                    src={video.videoFile.url}
                    controls
                    autoPlay
                    style={{ width: '100%', backgroundColor: 'black' }}
                />
                <h2>{video.title}</h2>
                <div>
                    <p>Owner: {video.owner.username} ({video.owner.subscribersCount} subscribers)</p>
                    <p>Likes: {video.likesCount} {video.isLiked ? '(You liked this)' : ''}</p>
                </div>
                <hr />
                <h3>Description</h3>
                <p>{video.description}</p>
                <hr />
                <h3>Comments</h3>
                {/* Comments section will go here */}
                <p>Comments coming soon...</p>
            </div>
            {/* Suggested Videos Sidebar */}
            <div style={{ flex: 1 }}>
                <h3>Up Next</h3>
                {/* Suggested videos will go here */}
            </div>
        </div>
    );
}