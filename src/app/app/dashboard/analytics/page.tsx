"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { AnalyticsResponse } from "@/services/accounts/analyticsService";
import { useAllAnalytics } from "@/hooks/data/useAllAnalytics";
import { Button } from "@/components/ui/button";

// Import components
import { StatsCards } from "../components/StatsCards.component";
import { RecentActivity } from "../components/RecentActivity.component"; 
import { BestPostingTimes } from "../components/BestPostingTimes.component";
import { EmptyState } from "../components/EmptyState.component";
import { DashboardHeader } from "../components/DashboardHeader.component";

// Import utilities
import { formatNumber } from "../utils/formatters";

export default function DashboardPage() {
  const { accountsWithAnalytics, isLoading, error, refreshData, hasAccounts } = useAllAnalytics();
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get the selected account with its analytics
  const selectedAccount = selectedAccountId 
    ? accountsWithAnalytics.find(account => account.id === selectedAccountId)
    : undefined;
    
  // Get analytics data from the selected account
  const analyticsData = selectedAccount?.analytics || null;

  // Handle manual refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;
    try {
      setIsRefreshing(true);
      await refreshData();
    } catch (err) {
      console.error('Error refreshing analytics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Set the first account as default when accounts are loaded
  useEffect(() => {
    if (!isLoading && accountsWithAnalytics.length > 0 && selectedAccountId === undefined) {
      setSelectedAccountId(accountsWithAnalytics[0].id);
    }
  }, [accountsWithAnalytics, isLoading, selectedAccountId]);

  if (isLoading) {
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
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasAccounts) {
    return (
      <div className="container min-h-screen py-8 px-6 space-y-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Card className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">No Connected Accounts</h3>
              <p className="text-muted-foreground mt-2">
                Please connect a YouTube account to view analytics data.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen py-8 px-6 space-y-8">
      <div className="flex justify-between items-center">
        <DashboardHeader 
          accounts={accountsWithAnalytics}
          selectedAccountId={selectedAccountId}
          onAccountSelect={(value) => setSelectedAccountId(value)}
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {!selectedAccountId ? (
        <EmptyState />
      ) : (
        <StatsCards analyticsData={analyticsData} formatNumber={formatNumber} />
      )}

      {selectedAccountId && analyticsData && (
        <>
          <RecentActivity analyticsData={analyticsData} formatNumber={formatNumber} />
          <BestPostingTimes analyticsData={analyticsData} formatNumber={formatNumber} />
        </>
      )}
    </div>
  );
}
