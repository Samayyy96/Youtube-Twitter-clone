// // app/page.tsx

// // Reverted to a Server Component for performance and SEO
// import VideoCard from "./components/VideoCard";
// import TagsBar from "./components/TagsBar";
// import type { Video } from './types';

// interface HomeProps {
//     searchParams: {
//         query?: string;
//         sortBy?: string;
//     };
// }

// // The data fetching function now accepts the filter parameters
// async function getVideos({ query, sortBy }: { query?: string, sortBy?: string }): Promise<Video[]> {
//     // Build the query string for the API call
//     const params = new URLSearchParams();
//     if (query && query !== 'All') {
//         params.append('query', query);
//     }
//     if (sortBy) {
//         params.append('sortBy', sortBy);
//         params.append('sortType', 'desc'); // Default to descending for views, likes, etc.
//     }

//     const apiUrl = `http://localhost:3000/api/v1/video/?${params.toString()}`;

//     try {
//         const response = await fetch(apiUrl, { cache: 'no-store' });
//         if (!response.ok) {
//             console.error("API Error:", await response.text());
//             return [];
//         }
//         const result = await response.json();
//         return result.data.docs || [];
//     } catch (error) {
//         console.error("Fetch Error:", error);
//         return [];
//     }
// }

// export default async function HomePage({ searchParams }: HomeProps) {
//     // Pass the searchParams from the URL to the data fetching function
//     const videos: Video[] = await getVideos(searchParams);

//     return (
//         <div>
//             {/* The TagsBar is a Client Component, but it can be used in a Server Component */}
//             <TagsBar />
            
//             <div className="p-4 md:p-6">
//                 {/* Updated grid to show 3 videos on large screens */}
//                 <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
//                     {videos.length > 0 ? (
//                         videos.map((video) => (
//                             <VideoCard key={video._id} video={video} />
//                         ))
//                     ) : (
//                         <p className="col-span-full text-center mt-8 text-gray-400">
//                             No videos found for this filter.
//                         </p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }


// 1. THIS IS THE MOST IMPORTANT CHANGE.
// It converts this page from a Server Component to a Client Component.
'use client';

import { useState, useEffect } from 'react';
import VideoCard from "./components/VideoCard";
import type { Video } from './types'; // Make sure you have this types file
import { useAuth } from './context/AuthContext'; // Import the auth hook

export default function HomePage() {
  // 2. Use React hooks for state management, just like in your upload page.
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the logged-in status to decide whether to fetch

  // 3. Use useEffect to fetch data when the component loads (or when login status changes).
  useEffect(() => {
    // Don't bother fetching if the user isn't logged in.
    

    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);

      

      try {
        // 5. Make the fetch call WITH the Authorization header.
        const response = await fetch('http://localhost:3000/api/v1/video/', {
          
        });

        const result = await response.json();


         if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch videos.');
         }


        setVideos(result.data.docs || []);

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

    fetchVideos();
  }, []); // Re-run this effect if the login status changes.


  // 6. Render UI based on the current state.
  if (isLoading) {
    return <p className="text-center mt-8">Loading videos...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-400">Error: {error}</p>;
  }
  
  

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))
        ) : (
          <p className="col-span-full text-center mt-8">No videos found. Be the first to upload!</p>
        )}
      </div>
    </div>
  );
}