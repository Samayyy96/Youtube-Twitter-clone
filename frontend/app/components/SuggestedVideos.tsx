'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SuggestedVideos({ currentVideoId }: { currentVideoId: string }) {
    // Add logic here to fetch videos from `/api/v1/video/`
    // You can filter out the currentVideoId from the results
    return (
        <div>
            <h3 className="font-bold mb-4">Up next</h3>
            <div className="space-y-3">
                 <p>Suggested videos coming soon...</p>
                {/* Map over fetched videos here to create small suggestion cards */}
            </div>
        </div>
    );
}