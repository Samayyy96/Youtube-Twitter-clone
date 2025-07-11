import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORT

export const metadata: Metadata = {
  title: 'MyTube',
  description: 'A modern video sharing platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0F0F0F] text-gray-200">
        <AuthProvider> {/* <-- WRAP EVERYTHING */}
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto">
              <Navbar />
              <div className="p-4 md:p-6">{children}</div>
            </main>
          </div>
        </AuthProvider> {/* <-- CLOSE WRAPPER */}
      </body>
    </html>
  );
}