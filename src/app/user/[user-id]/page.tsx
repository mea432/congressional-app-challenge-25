export default function userPage({ params }: { params: { userId: string } }) {
  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {params.userId}</p>
      {/* Add user profile content here */}
    </div>
  );
}