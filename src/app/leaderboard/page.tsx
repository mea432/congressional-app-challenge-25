'use client';

import PageProtected from "@/components/authentication";
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from "@/components/bottom-navbar";
import MainContent from "@/components/main-content";
import LeaderboardTable from "@/components/leaderboard-table";

export default function Leaderboard() {
  return (
    <PageProtected>
      {(user) => (
        <>
          <TopNavbar />
          <MainContent>
            <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
            <p className="text-lg text-gray-700">Users who actually touch grass:</p>
            {/* Leaderboard content */}
            <LeaderboardTable />
          </MainContent>
          <BottomNavbar />
        </>
      )}
    </PageProtected>
  );
}