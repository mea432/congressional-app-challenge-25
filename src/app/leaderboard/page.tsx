'use client';

import Image from "next/image";

import PageProtected from "@/components/authentication";
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from "@/components/bottom-navbar";
import MainContent from "@/components/main-content";

import { db } from "../firebaseConfig";
import { collection, getDocs, orderBy, limit, query, getDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  displayName: string;
  points: number;
  avatar: string;
}

type StreakEntry = {
  userA: UserData;
  userB: UserData;
  streak: number;
};

export default function Leaderboard() {
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchTopPointsUsers = async () => {
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
          avatar: data.avatar,
        });
      });

      setUsers(usersData);
    };

    fetchTopPointsUsers();
  }, []);

  const [topStreaks, setTopStreaks] = useState<StreakEntry[] | null>(null);

  useEffect(() => {
    const fetchTopStreakUsers = async () => {
      const userSnap = await getDocs(collection(db, "users"));
      const usersMap: Record<string, UserData> = {};

      // Step 1: Get all users
      await Promise.all(
        userSnap.docs.map(async (userDoc) => {
          const data = userDoc.data();
          usersMap[userDoc.id] = {
            id: userDoc.id,
            displayName: data.displayName || "Unnamed",
            points: data.points || 0,
            avatar: data.avatar || "",
          };
        })
      );

      const streakEntries: StreakEntry[] = [];
      const seenConnections = new Set<string>();

      // Step 2: Loop through each user and their friends
      for (const userId of Object.keys(usersMap)) {
        const friendsSnap = await getDocs(collection(db, `users/${userId}/friends`));

        for (const friendDoc of friendsSnap.docs) {
          const friendId = friendDoc.id;
          const data = friendDoc.data();
          const connectionId = data.connectionId;

          if (!connectionId || seenConnections.has(connectionId)) continue;
          seenConnections.add(connectionId);

          try {
            const connectionDoc = await getDoc(doc(db, "connections", connectionId));
            if (!connectionDoc.exists()) continue;

            const connectionData = connectionDoc.data();
            const streak = connectionData.streak;

            if (typeof streak === "number" && usersMap[friendId]) {
              streakEntries.push({
                userA: usersMap[userId],
                userB: usersMap[friendId],
                streak,
              });
            }
          } catch (error) {
            console.error(`Failed to fetch connection ${connectionId}`, error);
          }
        }
      }

      // Step 3: Sort and return top 10
      const top10 = streakEntries
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 10);

      setTopStreaks(top10);
    };

    fetchTopStreakUsers();
  }, []);

  return (
    <PageProtected>
      {(user) => {
        return (
          <>
            <TopNavbar />
            <MainContent>
              <h1 className="text-2xl font-bold mb-2">🏆 Leaderboards</h1>
              <div>
                <p className="mb-4 text-gray-600">Top 10 users of all time</p>
                <ol className="space-y-2">
                  {users.map((u, index) => {
                    const isCurrentUser = u.id === user.uid;
                    return (
                      <li
                        key={u.id}
                        className={`rounded-lg shadow px-4 py-3 flex items-center justify-between ${isCurrentUser
                          ? "bg-yellow-100 border border-yellow-300"
                          : "bg-white"
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl font-semibold text-gray-700 w-6 text-right">
                            {index + 1}.
                          </span>
                          <Image
                            src={u.avatar || "/nothing.png"}
                            alt="avatar"
                            className="w-8 h-8 rounded-full border object-cover object-center"
                            width={32}
                            height={32}
                          />
                          <span className="font-medium text-gray-800">
                            {u.displayName}{" "}
                            {isCurrentUser && (
                              <span className="ml-1 text-xs font-semibold text-yellow-600 bg-yellow-200 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-orange-500 font-bold">
                          {u.points} pts
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <br />
              <div>
                <p className="mb-4 text-gray-600">Top 10 Streaks</p> {/* TODO: Make this look better and highlight the entry if you are on the leaderboard */}
                <ul>
                  {topStreaks === null ? ("Loading...") : (
                    topStreaks.map(({ userA, userB, streak }, index) => (
                      <li key={index}>
                        {userA.displayName} 🔥 {streak} 🔥 {userB.displayName}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </MainContent>
            <BottomNavbar />
          </>
        );
      }}

    </PageProtected>
  );
}
