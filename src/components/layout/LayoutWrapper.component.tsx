"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar.component";
import Sidebar from "@/components/layout/Sidebar.component";
import Breadcrumb from "@/components/layout/Breadcrumb.component";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  
  return (
    <>
      {isLandingPage ? (
        <>
          <Navbar />
          <main className="flex-1 flex flex-col items-center justify-center w-full pt-[72px]">
            {children}
          </main>
        </>
      ) : (
        <>
          <Sidebar />
          <div className="md:ml-64">
            <Breadcrumb />
            <main className="flex-1 flex flex-col items-center justify-center w-full">
              {children}
            </main>
          </div>
        </>
      )}
    </>
  );
}