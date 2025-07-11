// app/components/VideoCard.tsx

import Link from 'next/link';
// We no longer need to import 'Image' from 'next/image'
import type { Video } from '../types';

export default function VideoCard({ video }: { video: Video }) {
    const avatarUrl = video.ownerDetails?.avatar?.url || '/default-avatar.png';
    const username = video.ownerDetails?.username || 'Unknown User';

    return (
        <Link href={`/watch/${video._id}`}>
            <div className="flex flex-col gap-2">
                {/* === THUMBNAIL: CHANGED FROM <Image> to <img> === */}
                <div className="relative aspect-video w-full">
                    <img
                        src={video.thumbnail.url}
                        alt={video.title}
                        className="rounded-xl object-cover w-full h-full"
                        // We no longer use 'fill', 'width', or 'height' props from next/image
                        // Instead, we use standard CSS/Tailwind classes for sizing.
                    />
                </div>
                {/* Details */}
                <div className="flex gap-3 mt-2">
                    {/* === AVATAR: CHANGED FROM <Image> to <img> === */}
                    <div className="flex-shrink-0">
                        <img
                            src={avatarUrl}
                            alt={username}
                            className="rounded-full bg-gray-700 w-9 h-9 object-cover" // Explicitly set width and height with w-9 and h-9
                        />
                    </div>
                    {/* Video Info */}
                    <div className="flex flex-col">
                        <h3 className="font-bold text-md leading-snug line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{username}</p>
                        <p className="text-sm text-gray-400">
                            {video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}