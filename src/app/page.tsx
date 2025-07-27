import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-6 text-gray-800">
      <Image
        src="/group-of-friends.JPG"
        alt="Background"
        fill // Fills the parent container
        style={{ objectFit: 'cover', zIndex: -1 }} // Covers the area and positions behind
      />
      <a href="https://www.vecteezy.com/free-photos/autumn" className="absolute bottom-0 right-0 text-white">Autumn Stock photos by Vecteezy</a>
      <div className="w-full max-w-4xl p-8 rounded-2xl shadow-lg border border-gray-200 bg-white">
        <Image src="/logo.png" alt="logo" width={150} height={150} className="mx-auto" />
        <h1 className="text-center text-5xl font-extrabold text-blue-600 mb-6">
          [App name]
        </h1>

        <p className="text-center text-lg md:text-xl mb-8">
          Tired of endless scrolling and online addiction? [App name] is the reverse social media app that brings friends back together in person.
        </p>

        <ul className="text-center max-w-xl mx-auto mb-12 space-y-3 text-gray-700">
          <li>Add friends and build meaningful connections.</li>
          <li>Meet up in person and log meetups by scanning QR codes.</li>
          <li>Capture memories with optional meetup selfies.</li>
          <li>Build streaks by meeting consistently whether daily, weekly, or monthly.</li>
          <li>Earn points for streaks and compete on the leaderboard.</li>
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
