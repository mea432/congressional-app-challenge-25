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
          <div>
            <h1>Leaderboard</h1>
            <p>Users who actually touch grass:</p>
            {/* Add leaderboard content here */}
          </div>
          <BottomNavbar />
        </>
      )}
    </PageProtected>
  );
}