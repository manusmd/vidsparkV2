"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ROUTES from "@/lib/routes";

export const QuickActions = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-3 px-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm mb-6">
      <div className="flex items-center gap-2">
        <Button 
          className="h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-blue-700/20 border-0"
          onClick={() => router.push(ROUTES.PAGES.APP.CREATE)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Video
        </Button>
      </div>
    </div>
  );
}; 