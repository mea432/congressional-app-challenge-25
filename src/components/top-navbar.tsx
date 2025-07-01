'use client';

import { useState } from 'react';
import { ArrowLeft, Settings, User } from 'lucide-react';
import ProfileComponent from '@/components/profile';
import SettingsComponent from '@/components/settings';

export default function TopNavbar() {
  const [activeOverlay, setActiveOverlay] = useState<'profile' | 'settings' | null>(null);

  const handleBack = () => setActiveOverlay(null);

  // Get overlay label
  const overlayLabel = activeOverlay === 'profile' ? 'Profile' : activeOverlay === 'settings' ? 'Settings' : '';

  return (
    <>
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-52 px-4 py-3 flex justify-between items-center pointer-events-none">
        {activeOverlay ? (
          <div className="flex items-center justify-center space-x-2 pointer-events-auto h-full">
            <button
              onClick={handleBack}
              className="bg-white shadow-md rounded-full p-2"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <span className="text-lg font-medium text-black drop-shadow-sm">{overlayLabel}</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => setActiveOverlay('profile')}
              className="pointer-events-auto bg-white shadow-md rounded-full p-2"
            >
              <User className="w-6 h-6 text-gray-700" />
            </button>

            <button
              onClick={() => setActiveOverlay('settings')}
              className="pointer-events-auto bg-white shadow-md rounded-full p-2"
            >
              <Settings className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Overlay Content */}
      {activeOverlay === 'profile' && (
        <div className="fixed inset-0 z-51 bg-white overflow-auto pt-12">
          <ProfileComponent />
        </div>
      )}

      {activeOverlay === 'settings' && (
        <div className="fixed inset-0 z-51 bg-white overflow-auto pt-12">
          <SettingsComponent />
        </div>
      )}
    </>
  );
}
