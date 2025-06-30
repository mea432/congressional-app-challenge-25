import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Landing Page</h1>
      <Link href="/sign-in" className="mt-4 inline-block text-sm underline-offset-4 hover:underline">
        Sign In
      </Link>
      <br />
      <Link href="/sign-up" className="mt-4 inline-block text-sm underline-offset-4 hover:underline">
        Sign Up
      </Link>
    </div>
  );
}
