"use client";

import MainContent from "@/components/main-content"
import { Button } from "@/components/ui/button"

export default function tutorial() {
  return (
    <MainContent>
      <h1 className="text-2xl font-bold mb-2">Tutorial: How to use ____</h1>
      Streaks is a platform that makes it easy to track in-person meetups with your friends while having some friendly competition.
      <br />
      <br />
      To start a streak, first add your friend on the app by typing in their email address or send them an invite link.
      <br />
      <br />
      Once you’re added as friends, you can meet up with your friend in person. Then, open the app and tap the Scan tab at the bottom of your screen. Make sure to enable all required permissions, scanning won’t work without them!
      <br />
      <br />
      Once permissions are granted, you can either scan your friend’s QR code or tap your own QR code (also at the bottom of the screen) to enlarge it so your friend can scan you. After you’ve scanned, take a photo together to remember the meetup!
      <br />
      <br />
      On the home page, click on any friend you have added to see the friendship information, past meetups, and any selfies taken.
      <br />
      <br />
      It’s as simple as that!
      <br />
      <br />

      <Button onClick={() => window.location.replace("/home")}>Go to home page</Button>
    </MainContent>
  )
}
