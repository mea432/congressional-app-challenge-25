import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col justify-center items-center text-gray-800">
      <Image
        src="/group-of-friends.JPG"
        alt="Background"
        fill
        style={{ objectFit: 'cover', zIndex: -1 }}
      />
      <Link href="https://www.vecteezy.com/free-photos/autumn" className="absolute bottom-2 right-2 text-white bg-black/60 px-2 py-1 text-sm rounded z-10">Autumn Stock photos by Vecteezy</Link>
      <div className="max-w-4xl h-screen sm:h-auto p-8 sm:rounded-2xl sm:shadow-lg sm:border sm:border-gray-200 bg-white/60 backdrop-blur-sm">
        <Image src="/logo.png" alt="logo" width={100} height={100} className="mx-auto" />
        <h1 className="text-center text-4xl font-extrabold text-blue-600 mb-6">
          UnReel
        </h1>

        <p className="text-center text-lg mb-8">
          Tired of endless scrolling and online addiction? UnReel is the reverse social media app that brings friends back together in person.
        </p>

        <ul className="list-disc text-left max-w-xl mx-auto mb-12 space-y-3 text-gray-700">
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
