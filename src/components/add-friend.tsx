"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/app/firebaseConfig";
import MainContent from "@/components/main-content";

export default function AddFriendComponent() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch requests logic as a callback so it can be reused
  const fetchRequests = useCallback(async (uid: string) => {
    // Fetch incoming friend requests
    const inReqCol = collection(db, `users/${uid}/inFriendRequests`);
    const inSnapshot = await getDocs(inReqCol);
    const incoming = await Promise.all(
      inSnapshot.docs.map(async (docSnap) => {
        const userId = docSnap.id;
        const userDocSnap = await getDoc(doc(db, "users", userId));
        let userInfo = { id: userId };
        if (userDocSnap.exists()) {
          userInfo = { ...userInfo, ...userDocSnap.data() };
        }
        return userInfo;
      })
    );
    setIncomingRequests(incoming);

    // Fetch sent friend requests
    const outReqCol = collection(db, `users/${uid}/outFriendRequests`);
    const outSnapshot = await getDocs(outReqCol);
    const sent = await Promise.all(
      outSnapshot.docs.map(async (docSnap) => {
        const userId = docSnap.id;
        const userDocSnap = await getDoc(doc(db, "users", userId));
        let userInfo = { id: userId };
        if (userDocSnap.exists()) {
          userInfo = { ...userInfo, ...userDocSnap.data() };
        }
        return userInfo;
      })
    );
    setSentRequests(sent);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUserId(user.uid);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetchRequests(currentUserId);
  }, [currentUserId, fetchRequests]);

  const handleSearch = async () => {
    if (!search) return;
    setHasSearched(true);
    const q = query(collection(db, "users"), where("email", "==", search));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs
      .filter((doc) => doc.id !== currentUserId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    setResults(users);
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!currentUserId) return;

    try {
      // Check if already friends
      const friendDoc = await getDoc(doc(db, `users/${currentUserId}/friends`, targetUserId));
      if (friendDoc.exists()) {
        alert("You are already friends with this user.");
        return;
      }

      // Add to sender's outFriendRequests
      await setDoc(
        doc(db, `users/${currentUserId}/outFriendRequests`, targetUserId),
        { status: "pending", sentAt: Date.now() }
      );

      // Add to receiver's inFriendRequests
      await setDoc(
        doc(db, `users/${targetUserId}/inFriendRequests`, currentUserId),
        { status: "pending", receivedAt: Date.now() }
      );

      setSearch("");
      setResults([]);
      await fetchRequests(currentUserId);
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Failed to send friend request");
    }
  };

  const acceptFriendRequest = async (fromUserId: string) => {
    if (!currentUserId) return;
    try {
      // Create a connection document
      const connectionRef = await addDoc(collection(db, "connections"), {
        users: [currentUserId, fromUserId],
        createdAt: Date.now(),
      });
      // Add to both users' friends subcollections
      await setDoc(doc(db, `users/${currentUserId}/friends`, fromUserId), {
        friendId: fromUserId,
        connectionId: connectionRef.id,
      });
      await setDoc(doc(db, `users/${fromUserId}/friends`, currentUserId), {
        friendId: currentUserId,
        connectionId: connectionRef.id,
      });
      // Remove the friend requests
      await deleteDoc(doc(db, `users/${currentUserId}/inFriendRequests`, fromUserId));
      await deleteDoc(doc(db, `users/${fromUserId}/outFriendRequests`, currentUserId));
      await fetchRequests(currentUserId);
      alert("Friend request accepted!");
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Failed to accept friend request");
    }
  };

  const declineFriendRequest = async (fromUserId: string) => {
    if (!currentUserId) return;
    try {
      await deleteDoc(doc(db, `users/${currentUserId}/inFriendRequests`, fromUserId));
      await deleteDoc(doc(db, `users/${fromUserId}/outFriendRequests`, currentUserId));
      await fetchRequests(currentUserId);
    } catch (err) {
      console.error("Error declining request:", err);
      alert("Failed to decline friend request");
    }
  };

  const cancelSentRequest = async (toUserId: string) => {
    if (!currentUserId) return;
    try {
      await deleteDoc(doc(db, `users/${currentUserId}/outFriendRequests`, toUserId));
      await deleteDoc(doc(db, `users/${toUserId}/inFriendRequests`, currentUserId));
      await fetchRequests(currentUserId);
    } catch (err) {
      console.error("Error canceling request:", err);
      alert("Failed to cancel friend request");
    }
  };

  return (
    <MainContent>
      <h2 className="text-2xl font-bold mb-4">Add a Friend</h2>
      <div className="flex gap-2 mb-4">
        <Input
          type="email"
          placeholder="Enter email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button onClick={handleSearch} className="cursor-pointer">Search</Button>
      </div>

      <div className="space-y-2 mb-8">
        {hasSearched && results.length === 0 ? (
          <div className="text-gray-500">No users found.</div>
        ) : (
          results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between border p-2 rounded"
            >
              <span>{user.displayName} ({user.email})</span>
              <Button
                onClick={() => sendFriendRequest(user.id)}
                className="text-sm cursor-pointer"
              >
                Add
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Incoming Friend Requests</h3>
        {incomingRequests.length === 0 && <div className="text-gray-500">No incoming requests.</div>}
        {incomingRequests.map((user) => (
          <div key={user.id} className="flex items-center justify-between border p-2 rounded mb-2">
            <span>{user.displayName} ({user.email})</span>
            <div className="flex gap-2">
              <Button onClick={() => acceptFriendRequest(user.id)} className="text-sm cursor-pointer">Accept</Button>
              <Button onClick={() => declineFriendRequest(user.id)} className="text-sm cursor-pointer" variant="outline">Decline</Button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Sent Friend Requests</h3>
        {sentRequests.length === 0 && <div className="text-gray-500">No sent requests.</div>}
        {sentRequests.map((user) => (
          <div key={user.id} className="flex items-center justify-between border p-2 rounded mb-2">
            <span>{user.displayName} ({user.email})</span>
            <Button onClick={() => cancelSentRequest(user.id)} className="text-sm cursor-pointer" variant="outline">Cancel</Button>
          </div>
        ))}
      </div>
    </MainContent>
  );
}
