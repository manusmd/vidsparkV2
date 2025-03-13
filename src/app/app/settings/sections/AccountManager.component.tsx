"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/data/useAccounts";
import { AccountsList } from "@/app/app/settings/components/AccountsList.component";

export default function AccountsManager() {
  const { accounts, error, connectAccount, deleteAccount } = useAccounts();
  const [loading, setLoading] = useState(false);

  const handleConnectGoogle = async () => {
    setLoading(true);
    try {
      await connectAccount();
    } catch (err) {
      console.error("Error connecting with Google:", err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">
          Manage Connected Accounts
        </h1>
        <Button onClick={handleConnectGoogle} disabled={loading}>
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Connect YouTube</span>
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">Error: {error}</p>}
      <AccountsList
        accounts={accounts}
        onDelete={(id) =>
          deleteAccount(id).catch((err) =>
            console.error("Error deleting account:", err),
          )
        }
      />
    </div>
  );
}
