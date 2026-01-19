'use client';

import PageProtected from '@/components/authentication';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { db } from '@/app/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

function FriendPageInner() {
  const searchParams = useSearchParams();
  const friendId = searchParams.get("id");
  const [friendName, setFriendName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (friendId) {
      const fetchFriendData = async () => {
        const friendDoc = await getDoc(doc(db, `users`, friendId));
        if (friendDoc.exists()) {
          setFriendName(friendDoc.data().displayName || 'this user');
        }
      };
      fetchFriendData();
    }
  }, [friendId]);

  const getMeetupIdeas = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const response = await fetch('/api/generate-ideas', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.ideas) {
        setSuggestions(data.ideas);
      }
    } catch (error) {
      console.error('Failed to fetch meetup ideas:', error);
      alert('Could not fetch suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageProtected>
      {(user) => (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Meetup with {friendName}</h1>
          
          <Button onClick={getMeetupIdeas} disabled={isLoading}>
            Suggest a Meetup Idea
          </Button>

          {isLoading && <p className="mt-4">Generating ideas...</p>}

          {suggestions.length > 0 && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-2">Here are a few ideas:</h2>
              <ul className="list-disc pl-5 space-y-2">
                {suggestions.map((idea, index) => (
                  <li key={index}>{idea}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </PageProtected>
  );
}

export default function FriendPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FriendPageInner />
    </Suspense>
  );
}
