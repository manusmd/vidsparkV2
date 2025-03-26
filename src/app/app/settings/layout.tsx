"use client";

import { ReactNode } from "react";

export default function UserSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col w-full">
      {/* Main Layout */}
      <div className="flex flex-1 w-full">
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
