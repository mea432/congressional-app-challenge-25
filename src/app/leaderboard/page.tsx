'use client';

import PageProtected from "@/components/authentication";
import BottomNavbar from "@/components/bottom-navbar";

export default function Leaderboard() {
  return (
    <PageProtected>
      {(user) => (
        <>
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