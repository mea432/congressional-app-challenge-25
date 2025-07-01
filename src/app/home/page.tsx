"use client";

import Link from "next/link";

import PageProtected from "@/components/authentication";
import BottomNavbar from "@/components/bottom-navbar";

export default function Home() {
  return (
    <PageProtected>
      {(user) => (
        <>
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
            <p className="text-lg text-gray-700">This is the home page of your application.</p><br />
            <p>Your UID is: {user.uid}</p>
            <p>Your email is: {user.email}</p>
            <p>Your display name is: {user.displayName}</p>
            <Link href="/sign-out" className="mt-4 inline-block text-sm underline-offset-4 hover:underline">
              Sign Out
            </Link>
          </div>
          <BottomNavbar />
        </>
      )}
    </PageProtected>
  );
}