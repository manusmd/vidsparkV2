"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ROUTES from "@/lib/routes";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { label: "Performance Overview", href: ROUTES.PAGES.APP.ANALYTICS.OVERVIEW },
    { label: "Channel Analytics", href: ROUTES.PAGES.APP.ANALYTICS.CHANNEL },
    { label: "Video Analytics", href: ROUTES.PAGES.APP.ANALYTICS.VIDEO },
  ];

  const currentTab = tabs.find((tab) => tab.href === pathname)?.href || tabs[0].href;

  return (
    <div className="container min-h-screen py-8 px-6 space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Tabs value={currentTab} className="w-full">
          <TabsList className="w-full justify-start">
            {tabs.map((tab) => (
              <Link key={tab.href} href={tab.href} passHref>
                <TabsTrigger
                  value={tab.href}
                  className="flex-1 sm:flex-none"
                >
                  {tab.label}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  );
}