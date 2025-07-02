import { useEffect, useState } from "react";
import { auth } from "@/app/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import MainContent from "@/components/main-content";
import Link from "next/link";

export default function SettingsComponent() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
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
          <div><b>Display Name:</b> {user.displayName}</div>
          <Link href="/sign-out">Sign Out</Link>
          {/* Add more fields if needed */}
        </div>
      ) : (
        <div>Loading user info...</div>
      )}
    </MainContent>
  );
}
