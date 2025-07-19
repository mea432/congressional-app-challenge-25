import { db } from "@/app/firebaseConfig";
import { deleteDoc, doc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useState, useRef } from "react";
import { useGesture } from '@use-gesture/react';
import { animated, useSpring } from '@react-spring/web';
import MainContent from "./main-content";

export default function FriendInfo({
  friendId,
  connectionId,
  streak,
  meetups,
  onClose,
  currentUserId,
  onFriendRemoved,
  friendUsername,
  friendProfilePicUrl,
}: {
  friendId: string,
  connectionId: string,
  streak: number | undefined,
  meetups: any[],
  onClose: () => void,
  currentUserId: string,
  onFriendRemoved: () => void,
  friendUsername: string,
  friendProfilePicUrl: string,
}) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [{ y, scale }, api] = useSpring(() => ({ y: 0, scale: 1 }));
  const tapRef = useRef(0);

  const bind = useGesture({
    onDrag: ({ event, down, movement: [, my], last }) => {
      event.preventDefault();

      if (my > 100 && last) {
        setZoomedImage(null);
        return;
      }
      api.start({ y: down ? my : 0, scale: down ? 0.95 : 1 });
    }
  }, {
    drag: {
      from: () => [0, y.get()],
      filterTaps: true,
      threshold: 10,
      axis: 'y',
    }
  });

  const handleImageTap = () => {
    const now = Date.now();
    if (now - tapRef.current < 300) {
      setZoomedImage(null);
    }
    tapRef.current = now;
  };

  const handleRemoveFriend = async () => {
    if (confirm("Are you sure? Removing a friend is permanent and deletes all data from the friendship.")) {
      if (!currentUserId || !friendId || !connectionId) return;
      try {
        await deleteDoc(doc(db, "connections", connectionId));
        await deleteDoc(doc(db, `users/${currentUserId}/friends`, friendId));
        await deleteDoc(doc(db, `users/${friendId}/friends`, currentUserId));
        onClose();
        onFriendRemoved();
      } catch (err) {
        alert("Failed to remove friend.");
        console.error(err);
      }
    }
  };

  // --- New UpdateMeetIntervalButton logic starts here ---

  const [currentConnectionId, setCurrentConnectionId] = useState<string | null>(connectionId || null);
  const [meetInterval, setMeetInterval] = useState<number | "">("");
  const [loadingMeet, setLoadingMeet] = useState(false);
  const [message, setMessage] = useState("");

  const fetchConnection = async () => {
    setLoadingMeet(true);
    setMessage("");
    setCurrentConnectionId(null);
    setMeetInterval("");

    try {
      const connectionsRef = collection(db, "connections");
      const q = query(connectionsRef, where("users", "array-contains", currentUserId));
      const querySnapshot = await getDocs(q);

      let foundConnectionId: string | null = null;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const users: string[] = data.users || [];
        if (users.includes(friendId)) {
          foundConnectionId = docSnap.id;
          setMeetInterval(data.meetInterval ?? "");
        }
      });

      if (foundConnectionId) {
        setCurrentConnectionId(foundConnectionId);
      } else {
        setMessage("No connection found between these users.");
      }
    } catch (error) {
      console.error("Error fetching connection:", error);
      setMessage("Failed to fetch connection.");
    } finally {
      setLoadingMeet(false);
    }
  };

  const updateMeetInterval = async () => {
    if (!currentConnectionId) {
      setMessage("No connection to update.");
      return;
    }

    if (meetInterval === "" || isNaN(Number(meetInterval)) || Number(meetInterval) < 1) {
      setMessage("Please enter a valid positive number for meetInterval.");
      return;
    }

    setLoadingMeet(true);
    setMessage("");

    try {
      const connectionDocRef = doc(db, "connections", currentConnectionId);
      await updateDoc(connectionDocRef, {
        meetInterval: Number(meetInterval),
      });
      setMessage("meetInterval updated successfully!");
    } catch (error) {
      console.error("Error updating meetInterval:", error);
      setMessage("Failed to update meetInterval.");
    } finally {
      setLoadingMeet(false);
    }
  };

  // --- New UpdateMeetIntervalButton UI ---

  return (
    <div className="fixed inset-0 z-50 max-w-screen overflow-y-auto">
      <MainContent>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 cursor-pointer bg-white bg-opacity-80 rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-lg hover:bg-opacity-100 transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Profile Picture and Username */}
        <div className="flex flex-col items-center mb-4">
          {friendProfilePicUrl && (
            <Image
              src={friendProfilePicUrl}
              alt={`${friendUsername}'s profile picture`}
              width={96}
              height={96}
              className="rounded-full border-4"
              style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
            />
          )}
          <h2 className="mt-3 text-2xl font-semibold text-gray-900">{friendUsername}</h2>
        </div>

        {streak !== undefined && (
          <p className="text-center mb-4"><b>Streak:</b> {streak}</p>
        )}

        <h3 className="text-lg font-semibold mt-4">Meetups</h3>
        <ul className="space-y-4">
          {meetups.length === 0 ? (
            <li className="text-gray-500 italic">No meetups yet.</li>
          ) : (
            meetups.map(meetup => (
              <li key={meetup.id} className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm">
                <Image
                  src={meetup.selfie_url || "https://images.ctfassets.net/nnkxuzam4k38/49gp8M7icXzzcVLEld8xzL/6467d14e5d6769dedc8e8fd63f437e97/pure-white-background.jpg"}
                  alt="Meetup Selfie"
                  width={64}
                  height={64}
                  onClick={() => setZoomedImage(meetup.selfie_url)}
                  className="w-16 h-16 rounded-lg object-cover mr-4 border border-gray-200 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-gray-800 mb-1">
                    {meetup.caption || <span className="italic text-gray-400">No selfie taken</span>}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Date:</span>{" "}
                    {meetup.timestamp
                      ? new Date(meetup.timestamp).toLocaleString()
                      : <span className="italic text-gray-400">Unknown</span>}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Update Meet Interval Section */}
        <div className="border p-4 rounded my-6 max-w-md mx-auto bg-gray-50 shadow">
          <button
            onClick={fetchConnection}
            disabled={loadingMeet}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-3"
          >
            Get Connection & meetInterval
          </button>

          {currentConnectionId && (
            <>
              <p className="mt-3 break-words"><strong>Connection ID:</strong> {currentConnectionId}</p>
              <label className="block mt-2">
                Meet Interval:{" "}
                <input
                  type="number"
                  min={1}
                  value={meetInterval}
                  onChange={(e) =>
                    setMeetInterval(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="border rounded px-2 py-1 w-24"
                />
              </label>

              <button
                onClick={updateMeetInterval}
                disabled={loadingMeet}
                className="bg-green-600 text-white px-4 py-2 rounded mt-3"
              >
                Update meetInterval
              </button>
            </>
          )}

          {message && (
            <p className={`mt-3 text-sm ${message.toLowerCase().includes("failed") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </div>

        <button
          onClick={handleRemoveFriend}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow cursor-pointer"
        >
          Remove Friend
        </button>

        {zoomedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center flex-col"
            style={{ touchAction: 'none' }}
          >
            <p className="text-white text-sm mb-2">Double-tap or swipe down to exit</p>
            <animated.img
              {...bind()}
              onClick={handleImageTap}
              src={zoomedImage}
              alt="Zoomed Meetup"
              style={{ y, scale }}
              className="max-w-full max-h-full object-contain touch-zoom-pan"
            />
          </div>
        )}
      </MainContent>
    </div>
  );
}
