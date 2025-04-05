"use client";

import { useDataContext } from "@/contexts/DataContext";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook to access all account analytics data at once
 * Returns all connected accounts with their analytics data
 */
export function useAllAnalytics() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  
  try {
    const {
      accountsWithAnalytics,
      analyticsLoading,
      analyticsError,
      refreshAllAnalytics,
      accounts,
      accountsLoading,
    } = useDataContext();
    
    const refreshData = async () => {
      if (isRefreshing) return;
      
      try {
        setIsRefreshing(true);
        await refreshAllAnalytics();
      } catch (error) {
        console.error("Error refreshing analytics:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    return {
      accountsWithAnalytics,
      isLoading: analyticsLoading || accountsLoading || isRefreshing,
      error: analyticsError,
      refreshData,
      hasAccounts: accounts.length > 0,
    };
  } catch (e) {
    // This hook only works with DataContext
    console.error("useAllAnalytics requires DataContext:", e);
    
    return {
      accountsWithAnalytics: [],
      isLoading: false,
      error: "DataContext not available",
      refreshData: async () => {
        console.error("DataContext not available for refreshing analytics");
      },
      hasAccounts: false,
    };
  }
} 