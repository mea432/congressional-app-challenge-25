import { useEffect, useState } from "react";
import { auth } from "@/app/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";

import MainContent from "@/components/main-content";
import { Button } from "@/components/ui/button";

import { db } from "@/app/firebaseConfig"; // Ensure you import your Firestore instance

export default function ProfileComponent() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Fetch additional user data from Firestore
        try {
          const userDocRef = doc(db, "users", u.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUser({
              ...u,
              ...userDocSnap.data(),
            });
          } else {
            setUser(u);
          }
        } catch (error) {
          setUser(u);
        }
      } else {
        setUser(null);
      }
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
          <div><b>Points:</b> {user.points || 0}</div>
          <div><b>Avatar:</b> 
            <img 
              src={user.avatar} 
              alt="User Avatar" 
              className="w-24 h-24 rounded-full border mt-2 object-cover object-center"
            />
            <Button onClick={async () => {
              const url = prompt("Enter a link to your new avatar image:");
              if (url) {
                // Simple URL validation
                const isValidUrl = (str: string) => {
                  try {
                    new URL(str);
                    return true;
                  } catch {
                    return false;
                  }
                };

                if (!isValidUrl(url)) {
                  alert("Please enter a valid URL.");
                  return;
                }

                setUser((prev: any) => ({
                  ...prev,
                  avatar: url,
                }));

                // Optionally, update the avatar in your backend or Firebase user profile here
                try {
                  if (user?.uid) {
                    await updateDoc(doc(db, "users", user.uid), { avatar: url });
                  }
                } catch (e) {
                  const errorMessage = e instanceof Error ? e.message : String(e);
                  alert("Failed to update avatar." + errorMessage);
                }
              }
            }}>
            Edit avatar
            </Button>
          </div>
          {/* Add more fields if needed */}
        </div>
      ) : (
        <div>Loading profile...</div>
      )}
    </MainContent>
  );
}
