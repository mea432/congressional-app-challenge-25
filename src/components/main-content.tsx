import React from "react";

export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center h-[calc(100vh-4rem)] bg-gray-100 pt-16 w-full">
      <div className="w-full max-w-lg p-4">{children}</div>
    </div>
  );
}