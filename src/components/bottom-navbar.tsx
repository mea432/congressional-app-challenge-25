'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, QrCodeIcon, UserIcon } from 'lucide-react';

export default function BottomNavbar() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Scan', href: '/scan', icon: QrCodeIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner z-50 h-16">
      <div className="grid grid-cols-3 h-full py-3">
        {tabs.map(({ name, href, icon: Icon }) => {
          const active = pathname === href;
          return (
        <Link key={name} href={href} className="flex flex-col items-center text-sm">
          <Icon className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className={active ? 'text-blue-600' : 'text-gray-500'}>{name}</span>
        </Link>
          );
        })}
      </div>
    </nav>
  );
}
