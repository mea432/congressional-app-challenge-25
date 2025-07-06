'use client';

import PageProtected from '@/components/authentication';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { db } from '@/app/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function AddFriendInner() {
  const searchParams = useSearchParams();
  const friendId = searchParams.get("id") || "none";

  const sendFriendRequest = async (targetUserId: string, userId: string) => {
    if (!userId) return;
    try {
      if (targetUserId === userId) {
        alert("You cannot send a friend request to yourself.");
        return;
      }
      const friendDoc = await getDoc(doc(db, `users/${userId}/friends`, targetUserId));
      if (friendDoc.exists()) {
        alert("You are already friends with this user.");
        return;
      }
      await setDoc(
        doc(db, `users/${userId}/outFriendRequests`, targetUserId),
        { status: "pending", sentAt: Date.now() }
      );
      await setDoc(
        doc(db, `users/${targetUserId}/inFriendRequests`, userId),
        { status: "pending", receivedAt: Date.now() }
      );
      alert("Friend request sent successfully!");
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Failed to send friend request");
    }
  };

  return (
    <PageProtected>
      {(user) => (
        <>
          <p>Your user id: {user.uid}</p>
          <Button onClick={async () => { await sendFriendRequest(friendId, user.uid); window.location.replace("/home") }}>Send friend request</Button>
        </>
      )}
    </PageProtected>
  );
}

export default function AddFriend() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddFriendInner />
    </Suspense>
  );
}