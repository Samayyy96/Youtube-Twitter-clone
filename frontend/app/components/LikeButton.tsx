
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp } from 'lucide-react';

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
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-800 text-white hover:bg-gray-700';

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${buttonClasses} disabled:opacity-50`}
    >
      <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
      {likesCount}
    </button>
  );
}