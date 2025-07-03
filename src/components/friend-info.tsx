import { db } from "@/app/firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";

export default function FriendInfo({ friendId, connectionId, streak, meetups, onClose, currentUserId, onFriendRemoved }: { friendId: string, connectionId: string, streak: number | undefined, meetups: any[], onClose: () => void, currentUserId: string, onFriendRemoved: () => void }) {
  // Remove friend logic
  const handleRemoveFriend = async () => {
    if (!currentUserId || !friendId || !connectionId) return;
    try {
      // Remove the connection document
      await deleteDoc(doc(db, "connections", connectionId));
      // Remove from both users' friends subcollections
      await deleteDoc(doc(db, `users/${currentUserId}/friends`, friendId));
      await deleteDoc(doc(db, `users/${friendId}/friends`, currentUserId));
      onClose();
      onFriendRemoved();
    } catch (err) {
      alert("Failed to remove friend.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 max-h-screen overflow-y-auto bg-white p-6 pb-32">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 cursor-pointer">✕</button>
      <h2 className="text-xl font-bold mb-2">Friend Info</h2>
      <p><b>Friend ID:</b> {friendId}</p>
      <p><b>Connection ID:</b> {connectionId}</p>
      {streak !== undefined && (
        <p><b>Streak:</b> {streak}</p>
      )}
      {/* Add more friend info here if needed */}
      <h3 className="text-lg font-semibold mt-4">Meetups</h3>
      <ul className="space-y-4">
        {meetups.length === 0 ? (
          <li className="text-gray-500 italic">No meetups yet.</li>
        ) : (
          meetups.map(meetup => (
            <li
          key={meetup.id}
          className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm"
            >
          <img
            src={meetup.selfie_url}
            alt="Meetup Selfie"
            className="w-16 h-16 rounded-lg object-cover mr-4 border border-gray-200"
          />
          <div>
            <p className="font-medium text-gray-800 mb-1">
              {meetup.caption || <span className="italic text-gray-400">No caption</span>}
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
      <button
        onClick={handleRemoveFriend}
        className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow cursor-pointer"
      >
        Remove Friend
      </button>
    </div>
  );
}