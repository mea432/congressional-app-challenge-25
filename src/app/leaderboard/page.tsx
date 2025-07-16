'use client';

import Image from "next/image";

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
  avatar: string;
}

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

    useEffect(() => {
    const fetchTopStreakUsers = async () => {
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

    fetchTopStreakUsers();
  }, []);

  return (
    <PageProtected>
      {(user) => {

        return (
          <>
            <TopNavbar />
            <MainContent>
              <h1 className="text-2xl font-bold mb-2">🏆 Leaderboard</h1>
              <p className="mb-4 text-gray-600">Top 10 users of all time</p>
              <ol className="space-y-2">
                {users.map((u, index) => {
                  const isCurrentUser = u.id === user.uid;
                  return (
                    <li
                      key={u.id}
                      className={`rounded-lg shadow px-4 py-3 flex items-center justify-between ${
                        isCurrentUser
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
            </MainContent>
            <BottomNavbar />
          </>
        );
      }}

    </PageProtected>
  );
}