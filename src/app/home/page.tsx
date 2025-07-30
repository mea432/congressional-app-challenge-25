"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PageProtected from "@/components/authentication";
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from "@/components/bottom-navbar";
import { db } from "@/app/firebaseConfig";
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc, deleteField } from "firebase/firestore";
import MainContent from "@/components/main-content";
import FriendInfo from "@/components/friend-info";

function FriendsList({ user }: { user: any }) {
  const [friends, setFriends] = useState<any[] | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<{
    meetups: any[]; friendId: string, connectionId: string, streak?: number, friendUsername: string, friendProfilePicUrl: string
  } | null>(null);

  const fetchFriends = async () => {
    const friendsCol = collection(db, `users/${user.uid}/friends`);
    const snapshot = await getDocs(friendsCol);
    const friendsList = await Promise.all(snapshot.docs.map(async docSnap => {
      const data = docSnap.data();
      // Fetch friend's user document for displayName/email
      const userDocSnap = await getDoc(doc(db, "users", data.friendId));
      let displayName = data.friendId;
      let email = undefined;
      let avatar = undefined;
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        displayName = userData.displayName || data.friendId;
        email = userData.email;
        avatar = userData.avatar;
      }

      let streak = undefined;
      const connectionDoc = await getDoc(doc(db, "connections", data.connectionId));
      if (connectionDoc.exists()) {
        const connectionData = connectionDoc.data();
        if (connectionData.streak_expire !== undefined) {
          const today = new Date();
          const streak_expire_date = new Date(connectionData.streak_expire.toDate())
          console.log("Today: ", today)
          console.log("Steak expire: ", streak_expire_date)
          if (streak_expire_date < today) {
            console.log("Streak expired");
            await updateDoc(doc(db, "connections", data.connectionId), {
              streak: deleteField(),
              streak_expire: deleteField(),
            });
          } else {
            console.log("streak not expired")
            streak = connectionData.streak || undefined;
          }
        }
      }

      let meetups = [];
      const meetupsSnapshot = await getDocs(collection(db, "connections", data.connectionId, "meetups"));

      meetups = meetupsSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            selfie_url: data.selfie_url,
            caption: data.caption,
            timestamp: data.timestamp ? data.timestamp.toMillis ? data.timestamp.toMillis() : data.timestamp : 0,
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      console.log("Meetups for connection", data.connectionId, ":", meetups);

      return {
        id: docSnap.id,
        ...data,
        displayName,
        email,
        avatar,
        streak,
        meetups,
      };
    }));
    setFriends(friendsList);
  };

  useEffect(() => {
    if (!user) return;
    fetchFriends();
    // eslint-disable-next-line
  }, [user]);

  return (
    <div className="w-full">
      {selectedFriend ? (
        <FriendInfo
          friendId={selectedFriend.friendId}
          connectionId={selectedFriend.connectionId}
          currentUserId={user.uid}
          streak={selectedFriend.streak}
          meetups={selectedFriend.meetups}
          friendUsername={selectedFriend.friendUsername}
          friendProfilePicUrl={selectedFriend.friendProfilePicUrl}
          onClose={() => setSelectedFriend(null)}
          onFriendRemoved={fetchFriends}
        />
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">Your Friends</h2>
          <div className="space-y-2">
            {friends === null ? (
              <div className="text-gray-500">
                Loading...
              </div>
            ) : friends.length === 0 ? (
              <div className="text-gray-500">
                No friends yet. Add friends to see them here!
              </div>
            ) : (
              friends.map(friend => (
                <button
                  key={friend.friendId}
                  className="flex items-center gap-4 w-full bg-white rounded shadow p-3 hover:bg-gray-50 transition border cursor-pointer"
                  onClick={() => setSelectedFriend({ friendId: friend.friendId, connectionId: friend.connectionId, streak: friend.streak, meetups: friend.meetups, friendUsername: friend.displayName, friendProfilePicUrl: friend.avatar })} // Pass meetups to FriendInfo
                >
                  <Image
                    src={friend.avatar}
                    alt="avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border object-cover object-center"
                  />
                  <span className="text-lg font-medium">{friend.displayName}
                    {friend.streak !== undefined && (
                      <span className="ml-2 text-sm text-gray-500">Streak: {friend.streak}</span>
                    )}
                  </span>
                </button>
              )))
            }
          </div>
        </>)}
    </div>
  );
}

export default function Home() {
  return (
    <PageProtected>
      {(u) => (
        <>
          <TopNavbar />
          <MainContent>
            <FriendsList user={u} />
          </MainContent>
          <BottomNavbar />
        </>
      )}
    </PageProtected>
  );
}