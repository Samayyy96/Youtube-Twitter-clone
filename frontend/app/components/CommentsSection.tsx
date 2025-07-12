// app/components/CommentsSection.tsx

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, ThumbsDown, MoreVertical } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Define Types ---
interface CurrentUser {
    _id: string;
    username: string;
    avatar?: { url: string };
}
interface CommentOwner {
    username: string;
    fullName: string;
    avatar: { url: string };
}
interface Comment {
    _id: string;
    content: string;
    owner: CommentOwner;
    likesCount: number;
    isLiked: boolean;
    createdAt: string;
}

// --- Single Comment Card Component ---
// This component doesn't need changes but is included for completeness.
function CommentCard({ comment }: { comment: Comment }) {
    return (
        <div className="flex items-start gap-3">
            <Link href={`/${comment.owner.username}`}>
                <img src={comment.owner.avatar.url} alt={comment.owner.username} className="w-10 h-10 rounded-full" />
            </Link>
            <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                    <Link href={`/${comment.owner.username}`} className="font-semibold">@{comment.owner.username}</Link>
                    <span className="text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"><ThumbsUp size={14} /> {comment.likesCount}</button>
                    <button className="text-xs text-gray-400 hover:text-white"><ThumbsDown size={14} /></button>
                    <button className="text-xs font-semibold text-gray-400 hover:text-white">Reply</button>
                </div>
            </div>
            <button className="text-gray-400 hover:text-white"><MoreVertical size={16} /></button>
        </div>
    );
}


// --- Main Comments Section Component ---
export default function CommentsSection({ videoId }: { videoId: string }) {
    const { isLoggedIn } = useAuth(); // We only get isLoggedIn from context
    const router = useRouter();
    
    // --- State Management ---
    const [comments, setComments] = useState<Comment[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching Effect ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            try {
                // Fetch both comments and the current user at the same time
                const [commentsRes, currentUserRes] = await Promise.all([
                    fetch(`http://localhost:3000/api/v1/comment/${videoId}`, { headers }),
                    isLoggedIn ? fetch('http://localhost:3000/api/v1/users/current-user', { headers }) : Promise.resolve(null)
                ]);

                // Process comments
                if (commentsRes.ok) {
                    const result = await commentsRes.json();
                    setComments(result.data.docs || []);
                } else {
                    console.error("Failed to fetch comments");
                }

                // Process current user
                if (currentUserRes && currentUserRes.ok) {
                    const result = await currentUserRes.json();
                    setCurrentUser(result.data);
                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [videoId, isLoggedIn]);


    // --- Form Submission Handler ---
    const handleAddComment = async (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !isLoggedIn) {
            if (!isLoggedIn) router.push('/auth');
            return;
        }
        
        const token = localStorage.getItem('accessToken');
        
        try {
            const res = await fetch(`http://localhost:3000/api/v1/comment/${videoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: newComment })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            // Optimistic UI Update: Create a new comment object with the data we have
            const newlyAddedComment: Comment = {
                ...result.data, // The comment data from the API (_id, content, etc.)
                owner: { // Add the current user's details for immediate display
                    username: currentUser!.username,
                    fullName: '', // The API doesn't return this, but it's okay for UI
                    avatar: { url: currentUser!.avatar!.url }
                },
                likesCount: 0,
                isLiked: false,
            };
            
            setComments(prev => [newlyAddedComment, ...prev]);
            setNewComment(""); // Clear the input field
        } catch (err: any) {
            setError("Failed to post comment: " + err.message);
        }
    };


    return (
        <div className="mt-6">
            <h2 className="text-lg font-bold mb-4">{comments.length} Comments</h2>

            {/* Add Comment Form */}
            {isLoggedIn && (
                 <form onSubmit={handleAddComment} className="flex items-start gap-3 mb-8">
                    {currentUser?.avatar?.url ? (
                        <img src={currentUser.avatar.url} alt="your avatar" className="w-10 h-10 rounded-full"/>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                    )}
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full bg-transparent border-b border-gray-600 focus:border-white outline-none pb-1"
                        />
                        {newComment && (
                            <div className="text-right mt-2 space-x-2">
                                <button type="button" onClick={() => setNewComment('')} className="px-4 py-2 bg-gray-700 rounded-full text-sm font-semibold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 rounded-full text-sm font-semibold">Comment</button>
                            </div>
                        )}
                    </div>
                </form>
            )}

            {/* List of Comments */}
            {isLoading && <p>Loading comments...</p>}
            {error && <p className="text-red-400">Error: {error}</p>}
            <div className="space-y-6">
                {comments.map(comment => (
                    <CommentCard key={comment._id} comment={comment} />
                ))}
            </div>
        </div>
    );
}