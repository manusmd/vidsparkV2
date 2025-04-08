"use client";

import { useDataContext } from "@/contexts/DataContext";
import { useState } from "react";

/**
 * Hook to access all account analytics data at once
 * Returns all connected accounts with their analytics data
 */
export function useAllAnalytics() {
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    accountsWithAnalytics,
    analyticsLoading,
    analyticsError,
    refreshData,
    accounts,
    accountsLoading,
    isRefreshing,
  };
} 