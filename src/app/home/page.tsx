"use client";

import { useEffect, useState } from "react";
import PageProtected from "@/components/authentication";
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from "@/components/bottom-navbar";
import { db } from "@/app/firebaseConfig";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import MainContent from "@/components/main-content";

function FriendInfo({ friendId, connectionId, streak, onClose, currentUserId, onFriendRemoved }: { friendId: string, connectionId: string, streak: number | undefined, onClose: () => void, currentUserId: string, onFriendRemoved: () => void }) {
  // Remove friend logic
  const handleRemoveFriend = async () => {
    if (!currentUserId || !friendId || !connectionId) return;
    try {
      // Remove the connection document
      await deleteDoc(doc(db, "connections", connectionId));
      // Remove from both users' friends subcollections
      await deleteDoc(doc(db, `users/${currentUserId}/friends`, friendId));
      await deleteDoc(doc(db, `users/${friendId}/friends`, currentUserId));
      onClose();
      onFriendRemoved();
    } catch (err) {
      alert("Failed to remove friend.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[300px] relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 cursor-pointer">✕</button>
        <h2 className="text-xl font-bold mb-2">Friend Info</h2>
        <p><b>Friend ID:</b> {friendId}</p>
        <p><b>Connection ID:</b> {connectionId}</p>
        {streak !== undefined && (
          <p><b>Streak:</b> {streak}</p>
        )}
        {/* Add more friend info here if needed */}
        <button
          onClick={handleRemoveFriend}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow cursor-pointer"
        >
          Remove Friend
        </button>
      </div>
    </div>
  );
}

function FriendsList({ user }: { user: any }) {
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<{ friendId: string, connectionId: string, streak?: number } | null>(null);

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
        streak = connectionData.streak || undefined;
      }
      
      return {
        id: docSnap.id,
        ...data,
        displayName,
        email,
        avatar,
        streak,
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
      <h2 className="text-2xl font-semibold mb-4">Your Friends</h2>
      <div className="space-y-2">
        {friends.length === 0 && <div className="text-gray-500">No friends yet.</div>}
        {friends.map(friend => (
          <button
            key={friend.friendId}
            className="flex items-center gap-4 w-full bg-white rounded shadow p-3 hover:bg-gray-50 transition border cursor-pointer"
            onClick={() => setSelectedFriend({ friendId: friend.friendId, connectionId: friend.connectionId, streak: friend.streak })}
          >
            <img
              src={friend.avatar} // Use a default avatar if none exists
              alt="avatar"
              className="w-10 h-10 rounded-full border object-cover object-center"
            />
            <span className="text-lg font-medium">{friend.displayName}
              {friend.streak !== undefined && (
                <span className="ml-2 text-sm text-gray-500">Streak: {friend.streak}</span>
              )}
            </span>
          </button>
        ))}
      </div>
      {selectedFriend && (
        <FriendInfo
          friendId={selectedFriend.friendId}
          connectionId={selectedFriend.connectionId}
          currentUserId={user.uid}
          streak={selectedFriend.streak}
          onClose={() => setSelectedFriend(null)}
          onFriendRemoved={fetchFriends}
        />
      )}
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