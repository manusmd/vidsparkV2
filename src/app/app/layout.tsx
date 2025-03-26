"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TextDesignProvider } from "@/hooks/useTextDesign";
import { MusicProvider } from "@/providers/useMusic";
import ROUTES from "@/lib/routes";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.PAGES.AUTH.SIGNIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return (
    <TextDesignProvider videoId={id}>
      <MusicProvider videoId={id}>{children}</MusicProvider>
    </TextDesignProvider>
  );
}
