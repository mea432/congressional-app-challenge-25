"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {getFirestore, collection, query, where, getDocs, updateDoc, doc, arrayUnion} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const auth = getAuth();
const db = getFirestore();

export default function AddFriendComponent() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUserId(user.uid);
    });
    return unsubscribe;
  }, []);

  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("email", "==", search)
    );
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs
      .filter((doc) => doc.id !== currentUserId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    setResults(users);
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!currentUserId) return;

    await updateDoc(doc(db, "users", currentUserId), {
      sentRequests: arrayUnion(targetUserId),
    });

    await updateDoc(doc(db, "users", targetUserId), {
      friendRequests: arrayUnion(currentUserId),
    });

    alert("They'll probably say no lol");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add a Friend</h2>
      <div className="flex gap-2 mb-4">
        <Input
          type="email"
          placeholder="Enter email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="space-y-2">
        {results.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between border p-2 rounded"
          >
            <span>{user.displayName || user.email}</span>
            <Button
              onClick={() => sendFriendRequest(user.id)}
              className="text-sm"
            >
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
