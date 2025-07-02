import { useEffect, useState } from "react";
import { auth } from "@/app/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import MainContent from "@/components/main-content";

export default function ProfileComponent() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  return (
    <MainContent>
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      {user ? (
        <div className="space-y-2">
          <div><b>UID:</b> {user.uid}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>Display Name:</b> {user.displayName}</div>
          {/* Add more fields if needed */}
        </div>
      ) : (
        <div>Loading profile...</div>
      )}
    </MainContent>
  );
}
