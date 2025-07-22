import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-white px-6 text-gray-800">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-extrabold text-blue-600 mb-6">
          [App name]
        </h1>

        <p className="text-lg md:text-xl mb-8">
          Tired of endless scrolling and online addiction? [App name] is the reverse social media app that brings friends back together in person.
        </p>

        <ul className="text-left max-w-xl mx-auto mb-12 space-y-3 text-gray-700">
          <li>• Add friends and build meaningful connections.</li>
          <li>• Meet up in person and log meetups by scanning QR codes.</li>
          <li>• Capture memories with optional meetup selfies.</li>
          <li>• Build streaks by meeting consistently—daily, weekly, or monthly.</li>
          <li>• Earn points for streaks and compete on the leaderboard.</li>
        </ul>

        <div className="flex justify-center gap-6">
          <Link
            href="/sign-in"
            className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="px-6 py-3 rounded-md border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-600 hover:text-white transition"
          >
            Sign Up
          </Link>

          <Link href="/about"
            className="px-6 py-3 rounded-md border-2 border-blue-600 text-blue-600">
            About the creators
          </Link>
        </div>
      </div>
    </main>
  );
}
