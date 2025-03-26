"use client";

import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container py-8 px-6">
      {/* Main Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
