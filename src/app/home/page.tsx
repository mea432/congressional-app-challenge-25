"use client";

import Link from "next/link";
import QRCode from "@/components/qr-code";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <QRCode text="https://example.com" />
      <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
      <p className="text-lg text-gray-700">This is the home page of your application.</p>
      <Link href="/sign-out" className="mt-4 inline-block text-sm underline-offset-4 hover:underline">
        Sign Out
      </Link>
    </div>
  );
}