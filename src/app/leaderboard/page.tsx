'use client';

import Image from "next/image";

import PageProtected from "@/components/authentication";
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from "@/components/bottom-navbar";
import MainContent from "@/components/main-content";

import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
  getDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  displayName: string;
  points: number;
  avatar: string;
}

type StreakEntry = {
  id: string;
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
          avatar: data.avatar || "/Portrait_Placeholder.png",
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

      await Promise.all(
        userSnap.docs.map(async (userDoc) => {
          const data = userDoc.data();
          usersMap[userDoc.id] = {
            id: userDoc.id,
            displayName: data.displayName || "Unnamed",
            points: data.points || 0,
            avatar: data.avatar || "/Portrait_Placeholder.png",
          };
        })
      );

      const streakEntries: StreakEntry[] = [];
      const seenConnections = new Set<string>();

      for (const userId of Object.keys(usersMap)) {
        const friendsSnap = await getDocs(
          collection(db, `users/${userId}/friends`)
        );

        for (const friendDoc of friendsSnap.docs) {
          const friendId = friendDoc.id;
          const data = friendDoc.data();
          const connectionId = data.connectionId;

          if (!connectionId || seenConnections.has(connectionId)) continue;
          seenConnections.add(connectionId);

          try {
            const connectionDoc = await getDoc(
              doc(db, "connections", connectionId)
            );
            if (!connectionDoc.exists()) continue;

            const connectionData = connectionDoc.data();
            const streak = connectionData.streak;

            if (typeof streak === "number" && usersMap[friendId]) {
              streakEntries.push({
                id: connectionId,
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
                            src={u.avatar || "/Portrait_Placeholder.png"}
                            alt={`${u.displayName}'s avatar`}
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
                <p className="mb-4 text-gray-600">Top 10 Streaks</p>
                <ol className="space-y-2">
                  {topStreaks === null ? (
                    <p>Loading...</p>
                  ) : topStreaks.length === 0 ? (
                    <p>No streaks yet. Start one with a friend!</p>
                  ) : (
                    topStreaks.map(({ id, userA, userB, streak }, index) => {
                      const isCurrentUserInvolved =
                        userA.id === user.uid || userB.id === user.uid;
                      return (
                        <li
                          key={id}
                          className={`rounded-lg shadow px-4 py-3 flex items-center justify-between ${isCurrentUserInvolved
                              ? "bg-yellow-100 border border-yellow-300"
                              : "bg-white"
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl font-semibold text-gray-700 w-6 text-right">
                              {index + 1}.
                            </span>
                            <div className="flex -space-x-4">
                              <Image
                                src={userA.avatar}
                                alt={`${userA.displayName}'s avatar`}
                                className="w-8 h-8 rounded-full border-2 border-white object-cover object-center"
                                width={32}
                                height={32}
                              />
                              <Image
                                src={userB.avatar}
                                alt={`${userB.displayName}'s avatar`}
                                className="w-8 h-8 rounded-full border-2 border-white object-cover object-center"
                                width={32}
                                height={32}
                              />
                            </div>
                            <span className="font-medium text-gray-800">
                              {userA.displayName} & {userB.displayName}
                              {isCurrentUserInvolved && (
                                <span className="ml-2 text-xs font-semibold text-yellow-600 bg-yellow-200 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="text-orange-500 font-bold flex items-center gap-1">
                            {streak}
                            <span className="text-2xl">🔥</span>
                          </span>
                        </li>
                      );
                    })
                  )}
                </ol>
              </div>
            </MainContent>
            <BottomNavbar />
          </>
        );
      }}
    </PageProtected>
  );
}
