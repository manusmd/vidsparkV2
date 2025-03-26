"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash } from "lucide-react";
import type { Account } from "@/app/types";

interface AccountsListProps {
  accounts: Account[];
  onDelete: (id: string) => void;
}

export function AccountsList({ accounts, onDelete }: AccountsListProps) {
  // Group accounts by provider
  const groupedAccounts = (accounts || []).reduce<Record<string, Account[]>>((groups, account) => {
    const provider = account.provider || 'unknown';
    if (!groups[provider]) {
      groups[provider] = [];
    }
    groups[provider].push(account);
    return groups;
  }, {});

  // Get sorted provider names
  const providers = Object.keys(groupedAccounts).sort();

  // Helper function to capitalize provider name
  const capitalizeProvider = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <div className="space-y-8">
      {providers.map((provider) => (
        <div key={provider} className="space-y-4">
          <h3 className="text-lg font-semibold text-primary border-b pb-2">
            {capitalizeProvider(provider)}
          </h3>
          <div className="grid gap-4">
            {groupedAccounts[provider].map((account) => (
              <Card
                key={account.id}
                className="relative p-4 border border-border rounded-lg hover:bg-muted/10 transition w-full"
              >
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={() => onDelete(account.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>

                <div className="flex items-start gap-4">
                  {account.channelThumbnail ? (
                    <img
                      src={`/api/proxy/image?url=${encodeURIComponent(account.channelThumbnail)}`}
                      alt="Channel Thumbnail"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted" />
                  )}
                  <div className="flex flex-col gap-2">
                    <h4 className="font-semibold text-lg">{account.accountName}</h4>
                    {account.channelDescription && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line break-words line-clamp-2">
                        {account.channelDescription}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
