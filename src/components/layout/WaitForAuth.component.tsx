"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function WaitForAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return <>{children}</>;
}
