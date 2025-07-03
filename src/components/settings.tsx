import { useEffect, useState } from "react";
import { auth } from "@/app/firebaseConfig";
import { onAuthStateChanged, signOut, updateProfile, User } from "firebase/auth";
import MainContent from "@/components/main-content";
import { Button } from "./ui/button";

import { db } from "@/app/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function SettingsComponent() {
  const [user, setUser] = useState<any>(null);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setNewDisplayName(u?.displayName || "");
    });
    return unsubscribe;
  }, []);

  return (
    <MainContent>
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      {user ? (
        <div className="space-y-2">
          <div><b>UID:</b> {user.uid}</div>
          <div><b>Email:</b> {user.email}</div>
            <div className="flex items-center space-x-2">
            <b>Display Name:</b>
            {editingDisplayName ? (
              <>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="border rounded px-1 py-0.5 text-sm"
              />
              <Button
                size="sm"
                onClick={async () => {
                if (newDisplayName.trim() && user) {
                  await updateProfile(user as User, { displayName: newDisplayName });
                  await updateDoc(doc(db, "users", user.uid), { displayName: newDisplayName });
                  setUser({ ...user, displayName: newDisplayName });
                  setEditingDisplayName(false);
                }
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                setEditingDisplayName(false);
                setNewDisplayName(user.displayName || "");
                }}
              >
                Cancel
              </Button>
              </>
            ) : (
              <>
              <span>{user.displayName}</span>
              <button
                type="button"
                aria-label="Edit display name"
                className="ml-1"
                onClick={() => setEditingDisplayName(true)}
              >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500 hover:text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414z"
                />
                </svg>
              </button>
              </>
            )}
            </div>
          <Button onClick={() => signOut(auth)} className="text-sm cursor-pointer">Sign Out</Button>
          {/* Add more fields if needed */}
        </div>
      ) : (
        <div>Loading settings...</div>
      )}
    </MainContent>
  );
}
