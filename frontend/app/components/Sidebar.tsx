import Link from 'next/link';
import { GoHome, GoVideo } from 'react-icons/go';
import { MdSubscriptions, MdOutlineHistory, MdOutlineWatchLater, MdOutlineThumbUp } from 'react-icons/md';

const SidebarLink = ({ icon, text, href, active }: { icon: React.ReactNode, text: string, href: string, active?: boolean }) => {
  const activeClass = active ? 'bg-gray-700' : 'hover:bg-gray-700';
  return (
    <Link href={href} className={`flex items-center gap-4 px-3 py-2 rounded-lg text-sm ${activeClass}`}>
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[#0F0F0F] p-2 hidden md:flex flex-col border-r border-gray-800">
      <div className="space-y-2">
        <SidebarLink icon={<GoHome />} text="Home" href="/" active />
        <SidebarLink icon={<MdSubscriptions />} text="Subscriptions" href="/subscriptions" />
      </div>
      <hr className="my-4 border-gray-700" />
      <div className="space-y-2">
        <SidebarLink icon={<MdOutlineHistory />} text="History" href="/history" />
        <SidebarLink icon={<GoVideo />} text="Your videos" href="/my-videos" />
        <SidebarLink icon={<MdOutlineWatchLater />} text="Watch Later" href="/watch-later" />
        <SidebarLink icon={<MdOutlineThumbUp />} text="Liked videos" href="/liked" />
      </div>
    </aside>
  );
}