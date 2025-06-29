export default function userPage({ params }: { params: { 'user-id': string } }) {
  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {params['user-id']}</p>
      {/* Add user profile content here */}
    </div>
  );
}