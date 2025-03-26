import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { UserCredits, CreditTransaction, CreditPackage } from "@/services/credits/creditService";

interface UseCreditsReturn {
  credits: UserCredits | null;
  transactions: CreditTransaction[];
  packages: CreditPackage[];
  isLoading: boolean;
  error: Error | null;
  purchaseCredits: (packageId: string) => Promise<string>;
}

export function useCredits(): UseCreditsReturn {
  const { user, credits: authCredits, creditsLoading } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user transactions
  useEffect(() => {
    async function fetchTransactions() {
      if (!user) {
        return;
      }

      try {
        const response = await fetch("/api/credits");

        if (!response.ok) {
          console.warn("Could not fetch transactions, using empty list");
          setTransactions([]);
          return;
        }

        const data = await response.json();
        setTransactions(data.transactions);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }

    fetchTransactions();
  }, [user]);

  // Fetch credit packages
  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch("/api/credits/packages");

        if (!response.ok) {
          console.warn("Could not fetch credit packages, using empty list");
          // Set empty packages array instead of throwing an error
          setPackages([]);
          return;
        }

        const data = await response.json();
        setPackages(data.packages);
      } catch (err) {
        console.error("Error fetching credit packages:", err);
        // Set empty packages array instead of just setting the error
        setPackages([]);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }

    fetchPackages();
  }, []);

  // Function to purchase credits
  const purchaseCredits = async (packageId: string): Promise<string> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to purchase credits");
      }

      const data = await response.json();
      return data.checkoutUrl;
    } catch (err) {
      console.error("Error purchasing credits:", err);
      throw err;
    }
  };

  return {
    credits: authCredits,
    transactions,
    packages,
    isLoading: creditsLoading,
    error,
    purchaseCredits,
  };
}
