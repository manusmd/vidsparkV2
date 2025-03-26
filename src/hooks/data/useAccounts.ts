import { useEffect, useState } from "react";
import type { Account } from "@/app/types";
import { useAuth } from "@/hooks/useAuth";
import ROUTES from "@/lib/routes";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    if (user) {
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  const fetchAccounts = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(ROUTES.API.ACCOUNTS.BASE, { headers });
      const data = await res.json();
      setAccounts(data.accounts);
    } catch (err: unknown) {
      console.error("Error fetching accounts:", err);
      setError((err as Error).message || "Error fetching accounts");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  /**
   * Initiates the OAuth flow to connect a YouTube account.
   * 
   * This method calls the server-side API route that handles the OAuth flow.
   * The API route uses environment variables to access the Google client ID and secret,
   * which is the standard approach for Next.js API routes.
   * 
   * The Firebase Functions that handle YouTube uploads use Firebase Functions Secrets
   * to access the same Google client ID and secret, which is the recommended approach
   * for Firebase Functions.
   */
  const connectAccount = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      const res = await fetch(`${ROUTES.API.ACCOUNTS.CONNECT}?userId=${user.uid}`);
      const { url } = await res.json();
      const popupWindow = window.open(url, "_blank", "width=500,height=600");

      // Poll for window closure to refresh accounts
      if (popupWindow) {
        const checkClosed = setInterval(() => {
          if (popupWindow.closed) {
            clearInterval(checkClosed);
            fetchAccounts(); // Refresh the accounts list
          }
        }, 1000);
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(ROUTES.API.ACCOUNTS.DETAIL(id), {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete account");
      await fetchAccounts();
    } catch (err) {
      throw err;
    }
  };

  return { accounts, error, connectAccount, deleteAccount };
}
