// app/components/MainContent.tsx

'use client';

import { useAuth } from '../context/AuthContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useAuth();

    return (
        // This 'main' element will grow to fill the remaining space
        // Its left margin will adjust based on the sidebar's state, pushing the content
        <main 
            className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'ml-60' : 'ml-20'}`}
        >
            {children}
        </main>
    );
}