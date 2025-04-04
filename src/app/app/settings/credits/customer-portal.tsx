"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useStripePayments } from "@/hooks/useStripePayments";

export default function CustomerPortal() {
  const { user } = useAuth();
  const { createPortalSession } = useStripePayments();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const url = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      alert("Could not access subscription management portal. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleManageSubscription}
      disabled={!user || isLoading}
    >
      {isLoading ? "Loading..." : "Manage Subscription"}
    </Button>
  );
} 