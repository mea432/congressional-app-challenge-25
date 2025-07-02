'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Settings, User, UserPlus } from 'lucide-react';
import ProfileComponent from './profile';
import SettingsComponent from './settings';
import AddFriendComponent from './add-friend';

export default function TopNavbar() {
  const [activeOverlay, setActiveOverlay] = useState<'profile' | 'settings' | 'add-friend' | null>(null);
  const pathname = usePathname();

  const handleBack = () => setActiveOverlay(null);

  const overlayLabel =
    activeOverlay === null
      ? ''
      : {
          profile: 'Profile',
          settings: 'Settings',
          'add-friend': 'Add Friends',
        }[activeOverlay];

  const pageTitleMap: Record<string, string> = {
    '/home': 'Home',
    '/scan': 'Scan',
    '/leaderboard': 'Leaderboard',
  };

  const pageTitle = pageTitleMap[pathname] ?? '';

  return (
    <>
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-none">
        <div className="relative flex items-center justify-between h-12">
          {activeOverlay ? (
            <div className="pointer-events-auto flex items-center space-x-2">
              <button onClick={handleBack} className="bg-white shadow-md rounded-full p-2">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <span className="text-lg font-medium text-black">{overlayLabel}</span>
            </div>
          ) : (
            <>
              {/* Left - Profile */}
              <div className="pointer-events-auto">
                <button
                  onClick={() => setActiveOverlay('profile')}
                  className="bg-white shadow-md rounded-full p-2"
                >
                  <User className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Center - Page Title */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="bg-white px-4 py-1 rounded-full shadow text-sm font-medium text-gray-800">
                  {pageTitle}
                </div>
              </div>

              {/* Right - Add Friend + Settings */}
              <div className="pointer-events-auto flex space-x-3">
                <button
                  onClick={() => setActiveOverlay('add-friend')}
                  className="bg-white shadow-md rounded-full p-2"
                >
                  <UserPlus className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={() => setActiveOverlay('settings')}
                  className="bg-white shadow-md rounded-full p-2"
                >
                  <Settings className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overlay Content */}
      {activeOverlay === 'profile' && (
        <div className="fixed inset-0 z-40 bg-white overflow-auto">
          <ProfileComponent />
        </div>
      )}
      {activeOverlay === 'settings' && (
        <div className="fixed inset-0 z-40 bg-white overflow-auto">
          <SettingsComponent />
        </div>
      )}
      {activeOverlay === 'add-friend' && (
        <div className="fixed inset-0 z-40 bg-white overflow-auto">
          <AddFriendComponent />
        </div>
      )}
    </>
  );
}
