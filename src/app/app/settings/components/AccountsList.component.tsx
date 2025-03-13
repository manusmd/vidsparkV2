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
  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Card
          key={account.id}
          className="relative p-4 border border-border rounded-lg hover:bg-muted/10 transition w-full mx-auto"
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
                src={account.channelThumbnail}
                alt="Channel Thumbnail"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted" />
            )}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-xl">{account.accountName}</h4>
              {account.channelDescription && (
                <p className="text-sm text-muted-foreground whitespace-pre-line break-words mt-1">
                  {account.channelDescription}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
