import { useParams } from 'next/navigation';

export default function UserPage() {
  const params = useParams();
  const id = params['userId'] as string;

  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {id}</p>
      {/* Add user profile content here */}
    </div>
  );
}