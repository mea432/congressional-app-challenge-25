import React from "react";

export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] bg-gray-100 pt-16 w-full">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}