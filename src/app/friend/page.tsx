'use client';

import PageProtected from '@/components/authentication';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

import { db } from '@/app/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AddFriend() {
    const searchParams = useSearchParams();
    const friendId = searchParams.get("id") || "none"; // Replace with your default friend ID or handle it appropriately

    const sendFriendRequest = async (targetUserId: string, userId: string) => {
        if (!userId) return;
    
        try {
            if (targetUserId === userId) {
                alert("You cannot send a friend request to yourself.");
                return;
            }
        
          // Check if already friends
          const friendDoc = await getDoc(doc(db, `users/${userId}/friends`, targetUserId));
          if (friendDoc.exists()) {
            alert("You are already friends with this user.");
            return;
          }
    
          // Add to sender's outFriendRequests
          await setDoc(
            doc(db, `users/${userId}/outFriendRequests`, targetUserId),
            { status: "pending", sentAt: Date.now() }
          );
    
          // Add to receiver's inFriendRequests
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