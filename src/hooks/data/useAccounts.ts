import { useEffect, useState } from "react";
import type { Account } from "@/app/types";
import { useAuth } from "@/hooks/useAuth";
import ROUTES from "@/lib/routes";
import { useDataContext } from "@/contexts/DataContext";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const dataContext = useDataContext();

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    if (user) {
      const token = await user.getIdToken();
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const res = await fetch(ROUTES.API.ACCOUNTS.BASE, { headers });
      const data = await res.json();

      // Ensure accounts is always an array
      if (data && data.data && Array.isArray(data.data.accounts)) {
        setAccounts(data.data.accounts);
      } else {
        console.warn("Accounts data is not in the expected format:", data);
        setAccounts([]);
      }
      return data.data?.accounts || [];
    } catch (err: unknown) {
      console.error("Error fetching accounts:", err);
      setError((err as Error).message || "Error fetching accounts");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccounts().catch(console.error);
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  // Try to use data from context if available
  if (dataContext) {
    // Return the data from context instead of making separate API calls
    return {
      accounts: dataContext.accounts,
      loading: dataContext.accountsLoading,
      error: dataContext.accountsError,
      connectAccount: dataContext.connectAccount,
      deleteAccount: dataContext.deleteAccount,
      refreshAccounts: dataContext.refreshAccounts,
    };
  }

  /**
   * Initiates the OAuth flow to connect a YouTube account.
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
            fetchAccounts().catch(console.error);
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

  return { 
    accounts, 
    error, 
    loading, 
    connectAccount, 
    deleteAccount, 
    refreshAccounts: fetchAccounts 
  };
}
