"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts } from "@/hooks/data/useAccounts";
import { AnalyticsResponse } from "@/services/accounts/analyticsService";

// Import components
import { StatsCards } from "./components/StatsCards.component";
import { RecentActivity } from "./components/RecentActivity.component";
import { BestPostingTimes } from "./components/BestPostingTimes.component";
import { EmptyState } from "./components/EmptyState.component";
import { DashboardHeader } from "./components/DashboardHeader.component";

// Import utilities
import { formatNumber } from "./utils/formatters";

export default function DashboardPage() {
  const { user } = useAuth();
  const { accounts, loading: accountsLoading } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (!accountsLoading && accounts.length === 0) {
        setError('No connected accounts found. Please connect a YouTube account to view analytics.');
        setLoading(false);
        return;
      }

      if (!selectedAccountId) {
        setAnalyticsData(null);
        setLoading(false);
        return;
      }

      const selectedAccount = accounts.find(account => account.id === selectedAccountId);
      if (!selectedAccount) {
        setSelectedAccountId(undefined);
        throw new Error('Selected account not found');
      }

      const response = await fetch(`/api/accounts/${selectedAccountId}/analytics`, {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const responseData = await response.json();
      setAnalyticsData(responseData.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accountsLoading) {
      fetchAnalytics();
    }
  }, [user, accounts, selectedAccountId, accountsLoading]);

  // Set the first account as default when accounts are loaded
  useEffect(() => {
    if (!accountsLoading && accounts.length > 0 && selectedAccountId === undefined) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, accountsLoading, selectedAccountId]);

  // formatNumber is now imported from utils/formatters

  if (loading || accountsLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container min-h-screen py-8 px-6 space-y-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Card className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">Unable to load dashboard data</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen py-8 px-6 space-y-8">
      <DashboardHeader 
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onAccountSelect={(value) => setSelectedAccountId(value)}
      />

      {!selectedAccountId ? (
        <EmptyState />
      ) : (
        <StatsCards analyticsData={analyticsData} formatNumber={formatNumber} />
      )}

      {selectedAccountId && (
        <>
          <RecentActivity analyticsData={analyticsData} formatNumber={formatNumber} />
          <BestPostingTimes analyticsData={analyticsData} formatNumber={formatNumber} />
        </>
      )}
    </div>
  );
}
