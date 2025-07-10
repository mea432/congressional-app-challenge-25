import Link from "next/link"
import MainContent from "@/components/main-content"

export default function tutorial() {
    return (
        <MainContent>
            <h1 className="text-2xl font-bold mb-2">Tutorial: How to use ____</h1>
            <p>Text here</p>

            <Link href="/home">Go to home page</Link>
        </MainContent>
    )
}