'use client';

import PageProtected from "@/components/authentication";
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from "@/components/bottom-navbar";

export default function Leaderboard() {
  return (
    <PageProtected>
      {(user) => (
        <>
          <TopNavbar />
          <div className="pt-16 m-4">
            <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
            <p className="text-lg text-gray-700">Users who actually touch grass:</p>
            {/* Add leaderboard content here */}
          </div>
          <BottomNavbar />
        </>
      )}
    </PageProtected>
  );
}