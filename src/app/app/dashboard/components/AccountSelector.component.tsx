"use client";

import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Account } from "@/app/types";

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string | undefined;
  onAccountSelect: (accountId: string) => void;
}

export function AccountSelector({ accounts, selectedAccountId, onAccountSelect }: AccountSelectorProps) {
  // Extract the selected account once to avoid multiple lookups
  const selectedAccount = selectedAccountId ? accounts.find(a => a.id === selectedAccountId) : undefined;

  // Prepare the selected account image URL once
  const selectedAccountImageUrl = selectedAccount?.channelThumbnail 
    ? `/api/proxy/image?url=${encodeURIComponent(selectedAccount.channelThumbnail)}` 
    : "";

  return (
    <div className="w-full md:w-72 lg:w-80">
      <Select
        value={selectedAccountId}
        onValueChange={onAccountSelect}
      >
        <SelectTrigger className="w-full border-2 hover:border-indigo-400 transition-all duration-200 focus:ring-indigo-500 h-12">
          <SelectValue placeholder="Select account">
            {selectedAccount && (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 border border-gray-200 shadow-sm">
                  <AvatarImage 
                    key={`selected-${selectedAccount.id}`}
                    src={selectedAccountImageUrl} 
                    alt={selectedAccount.accountName || "Channel"} 
                    crossOrigin="anonymous"
                  />
                  <AvatarFallback className="bg-indigo-100 text-indigo-800 text-xs">
                    {selectedAccount.accountName?.[0] || "C"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">
                  {selectedAccount.accountName || "Select account"}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {accounts.map((account) => {
            // Prepare each account's image URL once
            const accountImageUrl = account.channelThumbnail 
              ? `/api/proxy/image?url=${encodeURIComponent(account.channelThumbnail)}` 
              : "";

            return (
              <SelectItem key={account.id} value={account.id} className="py-3 px-2 hover:bg-indigo-50 transition-colors duration-150 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
                    <AvatarImage 
                      key={`account-${account.id}`}
                      src={accountImageUrl} 
                      alt={account.accountName} 
                      crossOrigin="anonymous"
                    />
                    <AvatarFallback className="bg-indigo-100 text-indigo-800">
                      {account.accountName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{account.accountName}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {account.channelDescription || "YouTube Channel"}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export default AccountSelector;
