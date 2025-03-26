"use client";

import React from "react";
import { Account } from "@/app/types";
import { AccountSelector } from "./AccountSelector.component";

interface DashboardHeaderProps {
  accounts: Account[];
  selectedAccountId: string | undefined;
  onAccountSelect: (accountId: string) => void;
}

export function DashboardHeader({ accounts, selectedAccountId, onAccountSelect }: DashboardHeaderProps) {
  // Extract the selected account once to avoid multiple lookups
  const selectedAccount = selectedAccountId ? accounts.find(a => a.id === selectedAccountId) : undefined;
  const selectedAccountName = selectedAccount?.accountName || "selected account";

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {accounts.length > 0 && (
          <AccountSelector 
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onAccountSelect={onAccountSelect}
          />
        )}
      </div>
      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
        <p className={`${selectedAccountId ? 'text-indigo-700' : 'text-indigo-500'} font-medium flex items-center`}>
          {selectedAccountId ? (
            <>
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
              <span>
                Showing analytics for <span className="font-semibold">{selectedAccountName}</span>
              </span>
            </>
          ) : (
            <>
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Please select a YouTube channel to view analytics</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default DashboardHeader;
