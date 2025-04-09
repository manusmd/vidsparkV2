"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ROUTES from "@/lib/routes";
import { Video, FileVideo, Archive, Files } from "lucide-react";

export default function MyVideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { 
      label: "All Videos", 
      href: ROUTES.PAGES.APP.MY_VIDEOS.ALL,
      icon: Files
    },
    { 
      label: "Drafts", 
      href: ROUTES.PAGES.APP.MY_VIDEOS.DRAFTS,
      icon: FileVideo
    },
    { 
      label: "Published", 
      href: ROUTES.PAGES.APP.MY_VIDEOS.PUBLISHED,
      icon: Video
    },
    { 
      label: "Archived", 
      href: ROUTES.PAGES.APP.MY_VIDEOS.ARCHIVED,
      icon: Archive
    },
  ];

  const currentTab = tabs.find((tab) => tab.href === pathname)?.href || tabs[0].href;

  return (
    <div className="container min-h-screen py-8 px-6 space-y-8">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Videos</h1>
        <Tabs value={currentTab} className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link key={tab.href} href={tab.href} className="flex-1 sm:flex-none">
                  <TabsTrigger
                    value={tab.href}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-background/50"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                </Link>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  );
}