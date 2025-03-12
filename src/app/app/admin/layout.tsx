"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NAV_ITEMS = [
  { name: "Content Types", path: "/app/admin/content-types" },
  { name: "Video Types", path: "/app/admin/video-types" },
  { name: "Users", path: "/app/admin/users" },
  { name: "Settings", path: "/app/admin/settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col w-full">
      {/* Mobile: Dropdown Navigation (Visible on Small Screens) */}
      <div className="sm:block md:hidden p-4 bg-card border-b border-border">
        <Select onValueChange={(value) => router.push(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a section..." />
          </SelectTrigger>
          <SelectContent>
            {NAV_ITEMS.map((item) => (
              <SelectItem key={item.path} value={item.path}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 w-full">
        {/* Sidebar (Hidden on Mobile) */}
        <aside className="hidden md:flex w-64 bg-card border-r border-border p-6 flex-col space-y-4 md:sticky md:top-20 md:h-[calc(100vh-80px)] overflow-hidden">
          <h2 className="text-xl font-semibold">Admin Settings</h2>
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={pathname === item.path ? "default" : "outline"}
                className="w-full justify-start"
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </aside>

        {/* Main Content - Full Width on Mobile, Limited on Desktop */}
        <main className="flex-1 p-4 md:p-8 w-full md:max-w-[calc(100vw-16rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
