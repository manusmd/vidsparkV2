"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              Manage your connected social media accounts.
            </CardDescription>
          </div>
          <Button onClick={handleConnectGoogle} disabled={loading}>
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Connect YouTube</span>
          </Button>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4">Error: {error}</p>}
          <AccountsList
            accounts={accounts}
            onDelete={(id) =>
              deleteAccount(id).catch((err) =>
                console.error("Error deleting account:", err),
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
