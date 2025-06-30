interface PageProps {
  params: { userId: string };
}

export default function UserPage({ params }: PageProps) {
  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {params.userId}</p>
      {/* Add user profile content here */}
    </div>
  );
}