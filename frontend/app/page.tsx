// app/page.tsx

// Reverted to a Server Component for performance and SEO
import VideoCard from "./components/VideoCard";
import TagsBar from "./components/TagsBar";
import type { Video } from './types';

interface HomeProps {
    searchParams: {
        query?: string;
        sortBy?: string;
    };
}

// The data fetching function now accepts the filter parameters
async function getVideos({ query, sortBy }: { query?: string, sortBy?: string }): Promise<Video[]> {
    // Build the query string for the API call
    const params = new URLSearchParams();
    if (query && query !== 'All') {
        params.append('query', query);
    }
    if (sortBy) {
        params.append('sortBy', sortBy);
        params.append('sortType', 'desc'); // Default to descending for views, likes, etc.
    }

    const apiUrl = `http://localhost:3000/api/v1/video/?${params.toString()}`;

    try {
        const response = await fetch(apiUrl, { cache: 'no-store' });
        if (!response.ok) {
            console.error("API Error:", await response.text());
            return [];
        }
        const result = await response.json();
        return result.data.docs || [];
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
}

export default async function HomePage({ searchParams }: HomeProps) {
    // Pass the searchParams from the URL to the data fetching function
    const videos: Video[] = await getVideos(searchParams);

    return (
        <div>
            {/* The TagsBar is a Client Component, but it can be used in a Server Component */}
            <TagsBar />
            
            <div className="p-4 md:p-6">
                {/* Updated grid to show 3 videos on large screens */}
                <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                    {videos.length > 0 ? (
                        videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))
                    ) : (
                        <p className="col-span-full text-center mt-8 text-gray-400">
                            No videos found for this filter.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}