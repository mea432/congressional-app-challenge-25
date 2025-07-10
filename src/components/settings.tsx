import { useEffect, useState } from "react";
import { auth } from "@/app/firebaseConfig";
import { onAuthStateChanged, signOut, updateProfile, User } from "firebase/auth";
import MainContent from "@/components/main-content";
import { Button } from "./ui/button";

import { db } from "@/app/firebaseConfig";
import { doc, updateDoc, getDocs, collection, deleteDoc } from "firebase/firestore";

export default function SettingsComponent() {
  const [user, setUser] = useState<any>(null);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setNewDisplayName(u?.displayName || "");
    });
    return unsubscribe;
  }, []);

  async function deleteAccount(uid: string) {
    if (!uid) return;
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      // 1. Get all friends to find all connectionIds
      const friendsCol = collection(db, `users/${uid}/friends`);
      const friendsSnap = await getDocs(friendsCol);
      const connectionIds = friendsSnap.docs.map(docSnap => docSnap.data().connectionId).filter(Boolean);
      // 2. Delete all connections
      await Promise.all(connectionIds.map(async (connectionId) => {
        if (connectionId) {
          await deleteDoc(doc(db, "connections", connectionId));
        }
      }));
      // 3. Delete all documents in user's /friends subcollection
      await Promise.all(friendsSnap.docs.map(async (docSnap) => {
        await deleteDoc(doc(db, `users/${uid}/friends`, docSnap.id));
        const friendId = docSnap.data().friendId;
        if (friendId) {
          await deleteDoc(doc(db, `users/${friendId}/friends`, uid));
        }
      }));
      // 4. Delete all documents in user's /inFriendRequests subcollection
      const inReqCol = collection(db, `users/${uid}/inFriendRequests`);
      const inReqSnap = await getDocs(inReqCol);
      await Promise.all(inReqSnap.docs.map(async (docSnap) => {
        await deleteDoc(doc(db, `users/${uid}/inFriendRequests`, docSnap.id));
      }));
      // 5. Delete all documents in user's /outFriendRequests subcollection
      const outReqCol = collection(db, `users/${uid}/outFriendRequests`);
      const outReqSnap = await getDocs(outReqCol);
      await Promise.all(outReqSnap.docs.map(async (docSnap) => {
        await deleteDoc(doc(db, `users/${uid}/outFriendRequests`, docSnap.id));
      }));
      // 6. Delete the user document itself
      await deleteDoc(doc(db, "users", uid));
      // 7. Delete the user from Firebase Authentication
      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (authError) {
          // If re-authentication is required, sign out and inform the user
          // Type-narrowing for FirebaseError
          const errorCode = (authError && typeof authError === 'object' && 'code' in authError) ? (authError as any).code : undefined;
          if (errorCode === 'auth/requires-recent-login') {
            alert("For security, please sign in again to delete your account.");
            await signOut(auth);
            return;
          } else {
            throw authError;
          }
        }
      }
      alert("Your account and all related data have been permanently deleted.");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("There was an error deleting your account. Please try again later.");
    } finally {
      setDeleting(false);
      signOut(auth);
    }
  }

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
            <Button>Change Password</Button>
          <br />

          <Button onClick={() => signOut(auth)} className="text-sm cursor-pointer">Sign Out</Button>
          <br />
          <Button onClick={() => deleteAccount(user.uid)} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      ) : (
        <div>Loading settings...</div>
      )}
    </MainContent>
  );
}
