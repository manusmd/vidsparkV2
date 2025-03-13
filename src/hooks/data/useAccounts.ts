import { useEffect, useState } from "react";
import type { Account } from "@/app/types";
import {
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";
import { firebaseConfig } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Helper to get the Authorization header with a Bearer token.
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
      const res = await fetch("/api/accounts", { headers });
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

  const getSecondaryAuth = () => {
    const appName = "Secondary";
    let secondaryApp;
    if (!getApps().find((app) => app.name === appName)) {
      secondaryApp = initializeApp(firebaseConfig, appName);
    } else {
      secondaryApp = getApp(appName);
    }
    return getAuth(secondaryApp);
  };

  const connectAccount = async () => {
    try {
      const secondaryAuth = getSecondaryAuth();
      await setPersistence(secondaryAuth, inMemoryPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
      const result = await signInWithPopup(secondaryAuth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const refreshToken = result.user.refreshToken;

      // Fetch channel details from YouTube Data API using the access token.
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${token}`,
      );
      const channelData = await channelRes.json();
      const channelSnippet = channelData.items[0]?.snippet || {};
      const channelDescription = channelSnippet.description || "";
      const channelThumbnail = channelSnippet.thumbnails?.default?.url || "";

      const headers = await getAuthHeader();
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          provider: "google",
          accountName: result.user.displayName,
          accountId: result.user.uid,
          token,
          refreshToken,
          channelDescription,
          channelThumbnail,
          userId: user?.uid,
        }),
      });
      await signOut(secondaryAuth);
      await fetchAccounts();
    } catch (err) {
      throw err;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/accounts/${id}`, {
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
