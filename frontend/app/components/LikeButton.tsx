
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp } from 'lucide-react';
import { formatViews } from '@/lib/utils';

interface LikeButtonProps {
  videoId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
}

export default function LikeButton({ videoId, initialLikesCount, initialIsLiked }: LikeButtonProps) {
  const router = useRouter();

  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  
  const [isPending, startTransition] = useTransition();

  const handleLike = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth'); 
      return;
    }

    
    setIsLiked(current => !current);
    setLikesCount(current => isLiked ? current - 1 : current + 1);

    startTransition(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/likes/toggle/v/${videoId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          setIsLiked(current => !current); 
          setLikesCount(current => isLiked ? current + 1 : current - 1); 
          console.error("Failed to update like status");
        }
      } catch (error) {
        setIsLiked(current => !current);
        setLikesCount(current => isLiked ? current + 1 : current - 1);
        console.error("Error toggling like:", error);
      }
    });
  };

const buttonClasses = isLiked
        ? 'bg-gray-700' // Liked state can be subtle
        : 'bg-gray-800';

    return (
        <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-2 pl-4 pr-3 py-2 hover:bg-gray-700 rounded-l-full text-sm font-semibold transition-colors ${buttonClasses} disabled:opacity-50`}
        >
            <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
            {formatViews(likesCount)}
        </button>
    );
}