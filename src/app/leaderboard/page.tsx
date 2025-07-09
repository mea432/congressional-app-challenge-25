'use client';

import PageProtected from "@/components/authentication";
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from "@/components/bottom-navbar";
import MainContent from "@/components/main-content";

import { db } from "../firebaseConfig";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  displayName: string;
  points: number;
}

export default function Leaderboard() {
  const [topTenUsers, setTopTenUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchTopTenUsers = async () => {
      const q = query(
        collection(db, "users"),
        orderBy("points", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const usersData: UserData[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        usersData.push({
          id: docSnap.id,
          displayName: data.displayName || "Unnamed",
          points: data.points || 0,
        });
      });

      setTopTenUsers(usersData);
    };

    fetchTopTenUsers();
  }, []);

  const [friendsRankings, setFriendsRankings] = useState<UserData[]>([]);

  useEffect(() => {
const fetchFriendsRankings = async () => {
      // Fetch the current user's friends' IDs
      const userDoc = await getDocs(query(collection(db, "users"), limit(1)));
      let friendsIds: string[] = [];
      userDoc.forEach((docSnap) => {
          const data = docSnap.data();
          friendsIds = data.friends || [];
      });

      // Fetch all friends' user data
      const usersData: UserData[] = [];
      if (friendsIds.length > 0) {
        const friendsSnapshots = await Promise.all(
          friendsIds.map(async (fid) => {
        const friendDoc = await getDocs(query(collection(db, "users"), limit(1)));
        let friendData: UserData | null = null;
        friendDoc.forEach((docSnap) => {
          if (docSnap.id === fid) {
            const data = docSnap.data();
            friendData = {
          id: docSnap.id,
          displayName: data.displayName || "Unnamed",
          points: data.points || 0,
            };
          }
        });
        return friendData;
          })
        );
        usersData.push(
          ...friendsSnapshots.filter(Boolean) as unknown as UserData[]
        );
      }

      // Also include the current user in the friends ranking

      // Sort by points descending
      usersData.sort((a, b) => b.points - a.points);

      setFriendsRankings(usersData);
    };

    fetchFriendsRankings();
  }, []);

  return (
    <PageProtected>
      {(user) => (
        <>
          <TopNavbar />
          <MainContent>
            <h1 className="text-2xl font-bold mb-2">🏆 Leaderboard</h1>
            <p className="mb-4 text-gray-600">Top 10 users of all time</p>
            <ol className="space-y-2">
              {topTenUsers.map((u, index) => (
                <li
                  key={u.id}
                  className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-semibold text-gray-700 w-6 text-right">{index + 1}.</span>
                    {u.id === user.uid && (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded mr-2">
                        You
                      </span>
                    )}
                    <span className="font-medium text-gray-800">{u.displayName}</span>
                  </div>
                  <span className="text-orange-500 font-bold">{u.points} pts</span>
                </li>
              ))}
            </ol>
            <br />
            <p className="mb-4 text-gray-600">Ranking among friends</p>
              {friendsRankings.map((u, index) => (
                <li
                  key={u.id}
                  className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-semibold text-gray-700 w-6 text-right">{index + 1}.</span>
                    {u.id === user.uid && (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded mr-2">
                        You
                      </span>
                    )}
                    <span className="font-medium text-gray-800">{u.displayName}</span>
                  </div>
                  <span className="text-orange-500 font-bold">{u.points} pts</span>
                </li>
              ))}
          </MainContent>
          <BottomNavbar />
        </>
      )}
    </PageProtected>
  );
}
