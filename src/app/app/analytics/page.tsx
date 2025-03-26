"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ROUTES from "@/lib/routes";

export default function AnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push(ROUTES.PAGES.APP.ANALYTICS.OVERVIEW);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      <p className="ml-2 text-lg">Redirecting...</p>
    </div>
  );
}