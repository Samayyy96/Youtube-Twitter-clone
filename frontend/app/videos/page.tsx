// app/videos/page.tsx

// 1. This directive turns the page into a Client Component.
'use client';

import { useState, useEffect } from 'react';

// =================================================================
// Keep your TypeScript interfaces as they are.
// =================================================================
interface Video {
  _id: string;
  title: string;
  description: string;
  videoFile: {
      url: string;
      public_id: string;
  };
  thumbnail: {
      url: string;
      public_id: string;
  };
  duration: number;
  // ... add any other fields
}

// NOTE: We only need the Video interface for this component now.

// =================================================================
// Create the Page Component using React Hooks
// =================================================================
export default function VideosPage() {
  // 2. Use state to manage data, loading, and errors.
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Use useEffect to fetch data when the component loads.
  useEffect(() => {
    // Define the async fetching function inside useEffect.
    const getVideos = async () => {
      setIsLoading(true);
      setError(null);

      // 4. Get the token from localStorage (this is why we need a Client Component).
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setIsLoading(false);
        return;
      }
      
      const apiUrl = "http://localhost:3000/api/v1/video/";

      try {
        // 5. Make the fetch call WITH the Authorization header.
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
          // Note: No 'cache' option is needed here, as client-side fetches
          // are generally not cached by Next.js in the same way.
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch videos.');
        }

        // Assuming your backend response for GET /videos is similar to the structure you provided before.
        if (result.success && result.data.docs) {
          setVideos(result.data.docs);
        } else {
          throw new Error(result.message || 'API did not return expected data.');
        }
      
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

    getVideos();
  }, []); // The empty dependency array [] means this effect runs only once on mount.

  // 6. Render UI based on the state.
  if (isLoading) {
    return <p style={{ padding: '2rem' }}>Loading videos...</p>;
  }

  if (error) {
    return <p style={{ padding: '2rem', color: 'red' }}>Error: {error}</p>;
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>Fetched Videos</h1>
      <p>This is a Client Component that fetches data from the browser.</p>
      
      {/* Display the raw JSON data */}
      <div style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
        <pre>
          {JSON.stringify(videos, null, 2)}
        </pre>
      </div>

      {videos.length === 0 && !isLoading && (
        <p style={{ marginTop: '1rem' }}>
          No videos found. You can upload one.
        </p>
      )}
    </main>
  );
}