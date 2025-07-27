import MainContent from "@/components/main-content"
import Link from "next/link";
export default function About() {
  return (
    <MainContent>
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-6">About</h1>
        <p className="text-lg leading-relaxed">
          We’re Eason Ni and Avery Chung, two high schoolers attending Choate Rosemary Hall who got tired of watching our friends and peers scroll their lives away.
        </p>
        <p className="text-lg leading-relaxed mt-10">
          Every lunch period and every free block ends up with heads down, eyes glued to screens. We realized that something was missing: real connections, the kind that happens in person, not online.
        </p>
        <p className="text-lg leading-relaxed mt-10">
          We believe social media shouldn’t replace your life, it should help you live it. Whether it’s grabbing coffee with a friend, joining a study group, or organizing a weekend hike, our app encourages you to experience the real world.
        </p>

      <Link href="/"
            className="px-6 py-3 rounded-md border-2 border-blue-600 text-blue-600 mt-10">
            Back to home page
      </Link>
      </div>
      
    </MainContent>
  )
}